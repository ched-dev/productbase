import { useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { buildQueryUrl, QueryFilter } from '@/lib/UrlParams'

/**
 * Hook for managing JSON query parameters with automatic encoding/decoding
 * @param key The query parameter key
 * @param defaultValue Optional default value if parameter is not present
 * @returns [currentValue, setValue] tuple
 */
export function useQueryParam<T>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | undefined) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentValue = useCallback((): T | undefined => {
    const paramValue = searchParams.get(key)
    if (!paramValue) {
      return defaultValue
    }

    try {
      return JSON.parse(decodeURIComponent(paramValue)) as T
    } catch (error) {
      console.error(`Failed to parse query parameter '${key}':`, error)
      return defaultValue
    }
  }, [searchParams, key, defaultValue])

  const setValue = useCallback((value: T | undefined) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === undefined) {
      newSearchParams.delete(key)
    } else {
      try {
        newSearchParams.set(key, encodeURIComponent(JSON.stringify(value)))
      } catch (error) {
        console.error(`Failed to serialize query parameter '${key}':`, error)
        return
      }
    }

    setSearchParams(newSearchParams, { replace: false })
  }, [searchParams, setSearchParams, key])

  return [currentValue(), setValue]
}

/**
 * Hook that automatically includes additional query parameters from current URL
 * @returns Function that builds URLs with automatic parameter preservation
 */
export function useBuildQueryUrl() {
  const { search } = useLocation()

  const getAdditionalParams = (): Record<string, string> => {
    const params: Record<string, string> = {}
    const searchParams = new URLSearchParams(search)

    // Preserve viewingId and any other params except 'query'
    searchParams.forEach((value, key) => {
      if (key !== 'query') {
        params[key] = value
      }
    })

    return params
  }

  return (path: string, query?: QueryFilter) => {
    const additionalParams = getAdditionalParams()
    return buildQueryUrl(path, query, additionalParams)
  }
}
