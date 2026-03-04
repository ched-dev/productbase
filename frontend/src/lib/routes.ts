/**
 * Routes helper to easily refer to and generate routes sitewide
 * 
 * Usage:
 * ```tsx
 * import { routes } from '@/lib/routes'
 * 
 * // Generate URLs by calling the route function
 * routes.feedback.list()                          // '/feedback'
 * routes.feedback.detail({ id: 'abc123' })        // '/feedback/abc123'
 * 
 * // Optional query string parameters (second argument)
 * routes.feedback.list({}, { sort: '-created' })  // '/feedback?sort=-created'
 * 
 * // Use .path for Router.tsx path props (keeps the :param placeholders)
 * routes.feedback.detail.path                     // '/feedback/:id'
 * ```
 */
export const routes = {
  home: defineRoute('/'),

  resetPassword: defineRoute('/reset-password'),
  acceptInvite: defineRoute('/accept-invite'),

  organizations: {
    list: defineRoute('/organizations'),
    new: defineRoute('/organizations/new'),
    detail: defineRoute<'id'>('/organizations/:id'),
    edit: defineRoute<'id'>('/organizations/:id/edit'),
    members: defineRoute<'id'>('/organizations/:id/members'),
  },
}

/**
 * Creates a route function from a path pattern string.
 * The returned function generates URLs by replacing :param placeholders
 * and appending optional query string parameters.
 *
 * Supports React Router v7 path syntax:
 *   :param   — required dynamic segment
 *   :param?  — optional (segment removed if param not provided)
 *   *        — splat (replaced with value of '*' param, or removed)
 *
 * Access the raw path via .path (for Router.tsx path props).
 */
function defineRoute<P extends string = never>(
  pathPattern: string
): RouteFunction<P> & { path: string } {
  const fn = (
    params?: Record<string, string>,
    query?: Record<string, string>
  ) => {
    let url = pathPattern

    if (params) {
      // Replace splat
      if ('*' in params) {
        url = url.replace('*', encodeURIComponent(params['*']))
      }
      // Replace named params (required and optional)
      url = Object.entries(params).reduce((p, [key, value]) => {
        if (key === '*') return p
        return p
          .replace(`:${key}?`, encodeURIComponent(value))
          .replace(`:${key}`, encodeURIComponent(value))
      }, url)
    }

    // Remove unfilled optional params and trailing splat
    url = url.replace(/\/:[^/]+\?/g, '').replace(/\/?\*$/, '')

    if (query && Object.keys(query).length > 0) {
      const qs = new URLSearchParams(query).toString()
      url = `${url}?${qs}`
    }
    return url
  }
  fn.path = pathPattern
  return fn as RouteFunction<P> & { path: string }
}

type RouteFunction<P extends string = never> = [P] extends [never]
  ? (params?: never, query?: Record<string, string>) => string
  : (params: Record<P, string>, query?: Record<string, string>) => string
