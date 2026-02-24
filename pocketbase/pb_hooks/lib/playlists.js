/// <reference path="../../../frontend/src/lib/types/Playlists.d.ts" />

const MockPlaylists = require(`${__hooks}/mock/playlists.js`);
const YoutubeApi = require(`${__hooks}/lib/youtubeApi.js`);
const VimeoApi = require(`${__hooks}/lib/vimeoApi.js`);

/**
 * Load the playlists saved in cache (pocketbase). Used to serve
 * latest to users since external API requests take too long.
 * @param {boolean} includeEmbed Include the embed property
 * @returns {Playlist[]}
 */
function loadPlaylistsFromCache(includeEmbed) {
  const pbPlaylists = $app.findRecordsByFilter(
    'playlists',
    null,
    '+playlist_type,+playlist_position', // sort
    1000,   // limit
    0,      // offset
  )
  /**
   * @type {Playlist[]}
   */
  let playlists = []
  const activePlaylistIds = getActivePlaylistIds()

  // unmarshal with only specific props
  pbPlaylists.forEach((pbPlaylist, position) => {
    // skip playlists not currently listed as active
    if (!activePlaylistIds.includes(pbPlaylist.get('playlist_id'))) {
      return
    }

    const playlist = new DynamicModel({
      playlist_id: pbPlaylist.get('playlist_id'),
      playlist_slug: pbPlaylist.get('playlist_slug'),
      playlist_position: position, // position within youtube + vimeo playlists
      playlist_title: pbPlaylist.get('playlist_title'),
      playlist_description: pbPlaylist.get('playlist_description'),
      playlist_duration: pbPlaylist.get('playlist_duration'),
      playlist_thumbnails: new DynamicModel({
        default: {},
        high: {},
        maxres: {},
        medium: {},
        standard: {}
      }),
      playlist_videos: []
    })
    pbPlaylist.unmarshalJSONField('playlist_thumbnails', playlist.playlist_thumbnails)
    pbPlaylist.unmarshalJSONField('playlist_videos', playlist.playlist_videos)
    playlists.push(playlist)
  })

  // remove hidden fields for anonymous users
  if (playlists && !includeEmbed) {
    playlists = playlists.map(removeProtectedPropertiesFromPlaylist)
  }

  return playlists
}

/**
 * Method to get YouTube playlists from environment variable config
 * @param {boolean} includeEmbed Include the embed property
 * @returns {Playlist[]}
 */
function fetchYouTubePlaylists(includeEmbed) {
  const YOUTUBE_PLAYLISTS = $os.getenv('YOUTUBE_PLAYLISTS')

  if (!YOUTUBE_PLAYLISTS) {
    $app.logger().error('No playlists found. Add them to environment variable YOUTUBE_PLAYLISTS.')
    return []
  }

  const playlistsIds = getPlaylistIds('YOUTUBE_PLAYLISTS')

  /**
   * @type {Playlist[]}
   */
  let playlists = YoutubeApi.fetchPlaylists(playlistsIds.join(','))

  savePlaylistsToCache(playlists, 'youtube')

  // remove hidden fields for anonymous users
  if (!includeEmbed) {
    playlists = playlists.map(removeProtectedPropertiesFromPlaylist)
  }

  return playlists
}

/**
 * Method to get Vimeo playlists from environment variable config
 * @param {boolean} includeEmbed Include the embed property
 * @returns {Playlist[]}
 */
function fetchVimeoPlaylists(includeEmbed) {
  const VIMEO_SHOWCASES = $os.getenv('VIMEO_SHOWCASES')

  if (!VIMEO_SHOWCASES) {
    $app.logger().error('No playlists found. Add them to environment variable VIMEO_SHOWCASES.')
    return []
  }

  const playlistsIds = getPlaylistIds('VIMEO_SHOWCASES')

  /**
   * @type {Playlist[]}
   */
  let playlists = VimeoApi.fetchShowcases(playlistsIds)

  savePlaylistsToCache(playlists, 'vimeo')

  // remove hidden fields for anonymous users
  if (!includeEmbed) {
    playlists = playlists.map(removeProtectedPropertiesFromPlaylist)
  }

  return playlists
}

/**
 * Fetch and cache any playlists configured
 * We rely on the fetch methods to cache the results
 */
function cacheAllPlaylists() {
  if (hasVimeoPlaylists()) {
    try {
      fetchVimeoPlaylists(true)
    } catch (e) {
      $app.logger().error('Failed to cache Vimeo contents', 'error', e.message)
    }
  }
  if (hasYouTubePlaylists()) {
    try {
      YoutubeApi.refreshToken()
      fetchYouTubePlaylists(true)
    } catch (e) {
      $app.logger().error('Failed to cache YouTube contents', 'error', e.message)
    }
  }
}

/**
 * Save the playlists to the Pocketbase Playlists collection
 * @param {Playlist[]} playlists 
 * @param {string} playlist_type youtube | vimeo
 */
function savePlaylistsToCache(playlists, playlist_type) {
  const cached_at = new Date()
  const collection = $app.findCollectionByNameOrId('playlists')

  try {
    $app.runInTransaction((txApp) => {
      const existingPlaylists = txApp.findRecordsByFilter(
        collection,
        'playlist_type = {:playlist_type}',
        '-id',  // sort
        1000,   // limit
        0,      // offset
        { playlist_type }
      )
      // delete all old caches
      existingPlaylists.map(txApp.delete)

      // create new records
      for (const playlist of playlists) {
        let record = new Record(collection, playlist)
        record.set('playlist_type', playlist_type)
        record.set('cached_at', cached_at)
        txApp.save(record)
      }
    })
    $app.logger().debug('Saved Playlists To Cache', 'playlist_type', playlist_type, 'playlists', playlists)
  } catch (e) {
    $app.logger().error('Save Playlists To Cache Failed', 'playlist_type', playlist_type, 'playlists', playlists, 'error', e.message)
  }
}

/**
 * Load the playlist IDs from the environment variables
 * @param {'YOUTUBE_PLAYLISTS'|'VIMEO_SHOWCASES'} envVarName environment variable name to load from
 * @returns 
 */
function getPlaylistIds(envVarName) {
  const pstring = $os.getenv(envVarName) || ''
  const playlistIds = []

  try {
    const ids = pstring.split(',').map(id => id.trim())
    playlistIds.push(...ids)
    $app.logger().debug('Playlist IDs', envVarName, pstring, 'playlistIds', playlistIds)
  } catch (e) {
    $app.logger().error('Environment variable '+envVarName+' is not properly formatted. Separate IDs by commas. E.g. "'+envVarName+'=xxxxx,xxxxx,xxxxx"', envVarName, pstring, 'error', e.message)
    return []
  }

  return playlistIds
}

/**
 * Get all the active playlist IDs from environment variables
 * @returns {string[]}
 */
function getActivePlaylistIds() {
  return [
    ...getPlaylistIds('YOUTUBE_PLAYLISTS'),
    ...getPlaylistIds('VIMEO_SHOWCASES')
  ]
}

/**
 * Removes the hidden properties from anon users (embedHtml, transcript)
 * @param {Playlist} playlist 
 * @returns {Playlist}
 */
function removeProtectedPropertiesFromPlaylist(playlist) {
  playlist.playlist_videos = playlist.playlist_videos.map(video => {
    const { embedHtml, transcript, ...freePlaylist } = video
    return freePlaylist
  })
  return playlist
}

function hasYouTubePlaylists() {
  return Boolean($os.getenv('YOUTUBE_PLAYLISTS'))
}

function hasVimeoPlaylists() {
  return Boolean($os.getenv('VIMEO_SHOWCASES'))
}

module.exports = {
  fetchYouTubePlaylists,
  hasYouTubePlaylists,
  fetchVimeoPlaylists,
  hasVimeoPlaylists,
  cacheAllPlaylists,
  loadPlaylistsFromCache
}