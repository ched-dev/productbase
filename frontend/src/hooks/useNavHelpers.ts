import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function useNavHelpers() {
  const location = useLocation()
  const navigate = useNavigate()

  /**
   * Check if a route path matches current page (using startsWith)
   * @param values array of match strings `['/', '/new']`
   * @returns boolean
   */
  const routeMatches = useCallback(
    (values: string[] = []) => {
      for (const path of values) {
        if (path === '/') {
          if (path === location.pathname) {
            return true
          } else {
            continue
          }
        }
        if (location.pathname.toLowerCase().startsWith(path)) {
          return true
        }
      }
      return false
    },
    [location.pathname]
  )

  /**
   * Creates a callback to navigate to another path within the app  
   * Use when you want to pass to an onClick callback
   * ```
   * onClick={navigateTo('/path')} // triggers when the click happens
   * ```
   * @param href `/path/name`
   * @returns void
   */
  const navigateTo = (href: string) => () => navigate(href) as void

  /**
   * Reload the page using `window.location.reload()`
   * @returns void
   */
  const reload = () => window.location.reload()

  /**
   * Go back one page
   * @returns void
   */
  const goBack = () => navigate(-1) as void

  return {
    routeMatches,
    navigateTo,
    reload,
    goBack,
  }
}
