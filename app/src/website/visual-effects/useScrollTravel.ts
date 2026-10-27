// Tracks window scroll position in a ref without re-rendering React.
// Flow: subscribe on mount → multiply scrollY by multiplier → store in ref on each scroll.
// Used by: shader backgrounds that need scroll-driven motion without state updates.

import { useEffect, useRef } from 'react'

// ===== MAIN FUNCTION =====

/**
 * Returns a ref whose `.current` is `window.scrollY * multiplier`.
 * Flow: 1. attach scroll listener  2. seed initial value  3. return ref
 */
export function useScrollTravel(multiplier: number) {
  const scrollOffsetRef = useRef(0)

  useEffect(() => {
    // 1. Keep the ref in sync whenever the page scrolls.
    const handleScroll = () => {
      scrollOffsetRef.current = window.scrollY * multiplier
    }

    // 2. Seed once so the first frame is correct before any scroll event.
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [multiplier])

  return scrollOffsetRef
}
