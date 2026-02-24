/// <reference path="../../../frontend/src/lib/types/Playlists.d.ts" />

/**
 * Get the YouTube connection record from Pocketbase
 */
function getYouTubeConnection() {
  const [connection] = $app.findRecordsByFilter(
    "connections", // collection
    "type = {:type}", // filter
    "-id", // sort
    1,     // limit
    0,     // offset
    { "type": "youtube" }
  )
  return connection
}

/**
 * Get the YouTube OAuth values from Pocketbase
 * @returns {YouTubeOAuth|null}
 */
function getYouTubeOAuth() {
  const connection = getYouTubeConnection()
  if (!connection) {
    return null
  }

  const youtubeAuth = new DynamicModel({
    access_token: "",
    expires_in: 3600, // 1 hour
    refresh_token: "",
    refresh_token_expires_in: 604800, // 7 days
    scope: "",
    token_type: ""
  })
  connection.unmarshalJSONField("details", youtubeAuth)

  if (youtubeAuth.access_token) {
    return youtubeAuth
  }

  return null
}

/**
 * Get the Vimeo Access Token value from Env Vars
 * @returns {string|null}
 */
function getVimeoAccessToken() {
  return $os.getenv('OAUTH_VIMEO_ACCESS_TOKEN') || null
}

module.exports = {
  getYouTubeConnection,
  getYouTubeOAuth,
  getVimeoAccessToken
}