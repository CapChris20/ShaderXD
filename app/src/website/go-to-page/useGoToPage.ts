// Hash-based client routing for the marketing site.
// Flow: read `#route` from the URL → listen for hashchange → scroll to top on change.
// Used by: WebsiteApp and TopBar links that call `go()`.

import { useEffect, useState } from 'react'

// ===== NAMED CONSTANTS =====

export const ROUTES = ['home', 'discover', 'sandbox', 'creators', 'pricing', 'signup'] as const
export type Route = (typeof ROUTES)[number]

const DEFAULT_ROUTE: Route = 'home'
const HASH_PREFIX = /^#\/?/

// ===== HELPER FUNCTIONS =====

/** Parse the current hash into a known route, or fall back to home. */
function readRouteFromHash(): Route {
  const hashBody = window.location.hash.replace(HASH_PREFIX, '')
  const isKnownRoute = (ROUTES as readonly string[]).includes(hashBody)
  return isKnownRoute ? (hashBody as Route) : DEFAULT_ROUTE
}

// ===== MAIN FUNCTIONS =====

/**
 * Subscribes to hash changes and returns the active route.
 * Flow: 1. seed from hash  2. listen for hashchange  3. jump to top on each change
 */
export function useGoToPage(): Route {
  const [activeRoute, setActiveRoute] = useState<Route>(readRouteFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      // 1. Mirror the new hash into React state.
      setActiveRoute(readRouteFromHash())
      // 2. Reset scroll so each page starts at the top.
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return activeRoute
}

/** Navigate by setting `window.location.hash`. */
export function goToPage(route: Route) {
  window.location.hash = route
}
