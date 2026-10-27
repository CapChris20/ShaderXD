// Defers mounting heavy children until the wrapper is near the viewport.
// Flow: observe intersection → set visible flag → render children only while visible.
// Used by: canvas and WebGL blocks so the browser does not exceed its context limit.

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// ===== NAMED CONSTANTS =====

const LAZY_WRAPPER_CLASS = 'lazy'

type MountWhenVisibleProps = {
  children: ReactNode
  margin?: string
}

// ===== MAIN FUNCTION =====

/**
 * Mounts children only while near the viewport.
 * Flow: 1. observe wrapper  2. toggle visible  3. render children when intersecting
 */
export function MountWhenVisible({ children, margin = '150px' }: MountWhenVisibleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const wrapperElement = wrapperRef.current
    if (!wrapperElement) return

    // 1. Flip visibility when the placeholder enters or leaves the expanded viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting)
      },
      { rootMargin: margin },
    )

    observer.observe(wrapperElement)
    return () => observer.disconnect()
  }, [margin])

  return (
    <div ref={wrapperRef} className={LAZY_WRAPPER_CLASS}>
      {isNearViewport ? children : null}
    </div>
  )
}
