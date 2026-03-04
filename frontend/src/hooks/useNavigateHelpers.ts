import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

let previousPath: string | null = null
export const setPreviousPath = (path: string) => { previousPath = path }

let navigateFn: ReturnType<typeof useNavigate> | null = null
export const setNavigate = (navigate: ReturnType<typeof useNavigate>) => {
  navigateFn = navigate
}

/**
 * A wrapper around React Router's `navigate()` function that can be used
 * outside of React components. For navigation inside components, use
 * `useNavigateHelpers().navigate()` instead.
 */
export const navigateUsingRouter = (to: string, options?: { replace?: boolean }) => {
  if (navigateFn) {
    navigateFn(to, options)
  } else {
    console.warn('navigate not initialized yet')
  }
}

export function useNavigateHelpers() {
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
   * onClick={handleNavigate('/path')} // triggers when the click happens
   * ```
   * @param href `/path/name`
   * @returns void
   */
  const handleNavigate = (href: string) => () => navigate(href) as void

  /**
   * Reload the page using `window.location.reload()`
   * @returns void
   */
  const reload = () => window.location.reload()

  /**
   * Go back to the previous page if it is within the app, otherwise navigate to
   * provided fallback URL
   * @param fallback `/path/name`
   * @returns void
   */
  const goBackOrNavigate = (fallback: string) => {
    const prev = previousPath
    navigate(prev ?? fallback)
  }

  return {
    routeMatches,
    navigate,
    handleNavigate,
    reload,
    goBackOrNavigate,
  }
}
