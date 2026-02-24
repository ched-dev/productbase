import { navigate } from '@/lib/navigate'
import fromPairs from 'lodash/fromPairs'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import qs from 'qs'

const getUrlSearch = () => {
  return window.location.search.slice(1)
}

const qsConfig = {
  allowDots: true,
  allowEmptyArrays: true,
}

type UrlStorageData = Record<string, unknown>

/**
 * Used when removing an item and we are now empty
 * @returns `false` if you want to cancel the update event
 */
type OnEmptyCallback = () => boolean

const urlStorage = {
  currentValue: '',
  hasValue: () => urlStorage.currentValue !== '',
  hasValueChanged: () => {
    return urlStorage.currentValue !== getUrlSearch()
  },
  setValueFromUrl: () => {
    const value = urlStorage.get()
    if (value) {
      urlStorage.set(value)
    }
  },
  syncChangesFromUrl: () => {
    if (urlStorage.hasValueChanged()) {
      urlStorage.setValueFromUrl()
    }
    console.log('urlStorage', urlStorage.get())
  },
  createUrlState: (newValue: UrlStorageData, withQuestion = true) => {
    return (withQuestion ? '?' : '') + qs.stringify(newValue, qsConfig)
  },
  getKeyValues: (): Record<string, string> => {
    if (getUrlSearch()) {
      const searchParams = new URLSearchParams(getUrlSearch())
      return fromPairs(Array.from(searchParams.entries()))
    }
    return {}
  },
  get: (key?: string): qs.ParsedQs | undefined => {
    if (getUrlSearch()) {
      const obj = qs.parse(getUrlSearch(), qsConfig)
      return key ? (get(obj, key) as qs.ParsedQs) : obj
    }
  },
  set: (newValue: UrlStorageData) => {
    urlStorage.navigate(window.location.pathname, newValue)
  },
  add: (key: string, value: string) => {
    const obj = urlStorage.getKeyValues()
    obj[key] = value
    urlStorage.set(obj)
  },
  remove: (key: string, onEmpty?: OnEmptyCallback) => {
    const obj = urlStorage.getKeyValues()
    delete obj[key]
    if (onEmpty && isEmpty(obj)) {
      if (onEmpty() === false) {
        // cancel remaining
        return
      }
    }
    urlStorage.set(obj)
  },
  clear: () => {
    urlStorage.currentValue = ''
    urlStorage.set({})
  },
  navigate: (path: string, newValue: UrlStorageData) => {
    urlStorage.currentValue = urlStorage.createUrlState(newValue, false)
    navigate(path + '?' + urlStorage.currentValue)
  },
}

/**
 * Usage
 * ```
 * const urlStore = useUrlStore()
 *
 * // listening for changes
 * useEffect(() => {
 *   urlStore.syncChangesFromUrl()
 *   return () => urlStore.clear()
 * }, [window.location.search])
 *
 * // updates value and url overwriting all data
 * urlStore.set({ some: 'object' })
 *
 * // navigate to new page with state
 * urlStore.navigate('/path/to', { some: 'object' })
 *
 * // create state url string
 * urlStore.createUrlState({ some: 'object' }) // '?some=object'
 *
 * // remove a key (updates value and url)
 * urlStore.remove('filter.exif.cameraMake')
 *
 * // gets the data in a key value format (no nesting)
 * urlStore.getKeyValues()
 * {
 *   dateFilter: '2020-04-00',
 *   filter.exif.cameraMake: 'Canon',
 * }
 * ```
 */
const useUrlStore = () => {
  return urlStorage
}

export default useUrlStore
