// Searchable shader library with category filters and mock prices.
// Flow: filter shader list → render grid → open selection in sandbox via `onOpen`.
// Used by: WebsiteApp when the route is `discover`.

import { useMemo, useState } from 'react'
import { shaders } from '../../shader-catalog'
import { PRICES, priceLabel } from '../mock-prices/mockPrices'
import { SiteFooter } from '../top-bar-and-footer/SiteFooter'
import { PageHeader } from '../top-bar-and-footer/PageHeader'
import { WireframeBackground } from '../visual-effects/backgrounds/WireframeBackground'

// ===== NAMED CONSTANTS =====

const ALL_CATEGORIES_LABEL = 'All'

type BrowseShadersProps = { onOpen: (shaderId: string) => void }

// ===== HELPER FUNCTIONS =====

function thumbUrl(shaderId: string) {
  return `${import.meta.env.BASE_URL}thumbs/${shaderId}.jpg`
}

function shaderMatchesFilters(
  shaderDef: (typeof shaders)[number],
  options: { category: string; freeOnly: boolean; searchNeedle: string },
) {
  const matchesCategory = options.category === ALL_CATEGORIES_LABEL || shaderDef.category === options.category
  const matchesFree = !options.freeOnly || (PRICES[shaderDef.id] ?? 0) === 0
  const haystack = `${shaderDef.name} ${shaderDef.category} ${shaderDef.description}`.toLowerCase()
  const matchesSearch = !options.searchNeedle || haystack.includes(options.searchNeedle)
  return matchesCategory && matchesFree && matchesSearch
}

// ===== MAIN FUNCTION =====

export function BrowseShaders({ onOpen }: BrowseShadersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_LABEL)
  const [freeOnly, setFreeOnly] = useState(false)

  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES_LABEL, ...Array.from(new Set(shaders.map((shaderDef) => shaderDef.category)))],
    [],
  )

  const filteredShaders = useMemo(() => {
    const searchNeedle = searchQuery.trim().toLowerCase()
    return shaders.filter((shaderDef) =>
      shaderMatchesFilters(shaderDef, {
        category: selectedCategory,
        freeOnly,
        searchNeedle,
      }),
    )
  }, [searchQuery, selectedCategory, freeOnly])

  const categoryPills = categoryOptions.map((categoryName) => {
    const isPressed = selectedCategory === categoryName
    return (
      <button
        key={categoryName}
        type="button"
        className="pill"
        aria-pressed={isPressed}
        onClick={() => setSelectedCategory(categoryName)}
      >
        {categoryName}
      </button>
    )
  })

  const resultCountLabel = `${filteredShaders.length} ${filteredShaders.length === 1 ? 'shader' : 'shaders'}`

  const gridCards = filteredShaders.map((shaderDef) => {
    const previewSrc = thumbUrl(shaderDef.id)
    return (
      <button key={shaderDef.id} type="button" className="d-card" onClick={() => onOpen(shaderDef.id)}>
        <img src={previewSrc} alt={`${shaderDef.name} preview`} loading="lazy" />
        <span className="d-cap">
          <span>
            <b>{shaderDef.name}</b>
            <small>{shaderDef.category}</small>
          </span>
          <em>{priceLabel(shaderDef.id)}</em>
        </span>
      </button>
    )
  })

  const emptyState = filteredShaders.length === 0 ? (
    <p className="empty">No shaders match. Clear the search or pick another category.</p>
  ) : null

  return (
    <>
      <PageHeader
        bg={<WireframeBackground />}
        title="Shader"
        accent="discovery"
        sub="Search the library, preview any shader, and open it in the sandbox to customise it."
      >
        <label className="sr" htmlFor="q">
          Search shaders
        </label>
        <input
          id="q"
          className="search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or category, for example glass or fire"
        />
      </PageHeader>
      <section className="page-sec">
        <div className="filters" role="group" aria-label="Category">
          {categoryPills}
          <label className="chk">
            <input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} /> Free only
          </label>
        </div>
        <p className="note">Prototype marketplace: prices are mock-ups and nothing is charged. Every shader opens in the sandbox.</p>
        <p className="count" aria-live="polite">
          {resultCountLabel}
        </p>
        <div className="d-grid">{gridCards}</div>
        {emptyState}
      </section>
      <SiteFooter />
    </>
  )
}
