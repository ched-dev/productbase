export interface QueryFilter {
  tags: string[]
  operator?: 'and' | 'or' // defaults to 'and'
  dateRange?: string
  missingTags?: boolean
}

export interface ParamsFilter {
  query?: QueryFilter
}

/**
 * Builds a URL with query parameters properly encoded
 * @param path The base path (e.g., '/', '/charts', '/new')
 * @param query Optional query filter object
 * @param additionalParams Optional additional query parameters to include
 * @returns URL string with properly encoded query parameters
 */
export function buildQueryUrl(
  path: string,
  query?: QueryFilter,
  additionalParams?: Record<string, string>
): string {
  const params = new URLSearchParams()

  if (query) {
    // Ensure operator defaults to 'and' if not provided
    const queryWithDefaults = { ...query, operator: query.operator || 'and' }
    params.set('query', JSON.stringify(queryWithDefaults))
  }

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value)
    })
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}
