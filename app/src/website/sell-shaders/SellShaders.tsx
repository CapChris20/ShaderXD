// Creator upload form and example earnings dashboard (prototype data).
// Flow: validate mock upload → show status → render stats beside the form.
// Used by: WebsiteApp when the route is `creators`.

import { useState } from 'react'
import type { FormEvent } from 'react'
import { shaders } from '../../shader-catalog'
import { CREATOR_SHARE } from '../mock-prices/mockPrices'
import { SiteFooter } from '../top-bar-and-footer/SiteFooter'
import { PageHeader } from '../top-bar-and-footer/PageHeader'
import { IsometricBackground } from '../visual-effects/backgrounds/IsometricBackground'

// ===== NAMED CONSTANTS =====

const PRICE_OPTIONS = [0, 1.99, 4.99, 9.99, 29.99] as const
const WEEKLY_EARNINGS_SAMPLE = [38, 52, 44, 61, 57, 73, 69, 88] as const

const TOP_SHADER_ROWS = [
  { name: 'Neon Grid Horizon', price: 4.99, sales: 46 },
  { name: 'Fractal Bulb', price: 9.99, sales: 21 },
  { name: 'Particle Swarm', price: 1.99, sales: 51 },
] as const

const DEFAULT_LIST_PRICE = 4.99

// ===== HELPER FUNCTIONS =====

function formatPriceOption(dollars: number) {
  return dollars === 0 ? 'Free' : `$${dollars.toFixed(2)}`
}

function creatorEarnedPerSale(listPrice: number) {
  return (listPrice * CREATOR_SHARE).toFixed(2)
}

function totalEarnedForRow(price: number, sales: number) {
  return (price * sales * CREATOR_SHARE).toFixed(2)
}

// ===== MAIN FUNCTION =====

export function SellShaders() {
  const [shaderName, setShaderName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(shaders[0].category)
  const [listPrice, setListPrice] = useState(DEFAULT_LIST_PRICE)
  const [chosenFileName, setChosenFileName] = useState('')
  const [formStatus, setFormStatus] = useState('')

  const categoryOptions = Array.from(new Set(shaders.map((shaderDef) => shaderDef.category)))
  const perSaleEarnings = creatorEarnedPerSale(listPrice)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    // 1. Require a shader name.
    if (!shaderName.trim()) {
      setFormStatus('Give your shader a name first.')
      return
    }

    // 2. Require a GLSL file selection.
    if (!chosenFileName) {
      setFormStatus('Choose a GLSL file to submit.')
      return
    }

    // 3. Prototype-only success copy.
    setFormStatus(
      `Prototype only: "${shaderName.trim()}" was not uploaded. In the real flow it would enter review here.`,
    )
  }

  const priceSelectOptions = PRICE_OPTIONS.map((dollars) => (
    <option key={dollars} value={dollars}>
      {formatPriceOption(dollars)}
    </option>
  ))

  const categorySelectOptions = categoryOptions.map((categoryName) => (
    <option key={categoryName}>{categoryName}</option>
  ))

  const weeklyBars = WEEKLY_EARNINGS_SAMPLE.map((weekAmount, weekIndex) => (
    <div className="bar1" key={weekIndex}>
      <span>{weekAmount}</span>
      <i style={{ height: `${weekAmount}%` }} />
    </div>
  ))

  const weekAxisLabels = WEEKLY_EARNINGS_SAMPLE.map((_, weekIndex) => <span key={weekIndex}>W{weekIndex + 1}</span>)

  const topShaderRows = TOP_SHADER_ROWS.map((row) => (
    <tr key={row.name}>
      <td>{row.name}</td>
      <td>${row.price.toFixed(2)}</td>
      <td>{row.sales}</td>
      <td>${totalEarnedForRow(row.price, row.sales)}</td>
    </tr>
  ))

  return (
    <>
      <PageHeader
        bg={<IsometricBackground />}
        title="Sell your"
        accent="shaders"
        sub="Upload your GLSL, set a price, and keep 70% of every sale. Payouts weekly."
      />
      <section className="page-sec two-col">
        <form className="panel" onSubmit={handleSubmit} noValidate>
          <h2 className="panel-title">Upload a shader</h2>
          <p className="muted">Pro plan required to publish. Every upload is reviewed before it appears in the marketplace.</p>
          <label className="f">
            Shader name
            <input
              className="field"
              value={shaderName}
              onChange={(event) => setShaderName(event.target.value)}
              placeholder="Velvet Static"
            />
          </label>
          <label className="f">
            Category
            <select className="field" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              {categorySelectOptions}
            </select>
          </label>
          <label className="f">
            Price
            <select className="field" value={listPrice} onChange={(event) => setListPrice(Number(event.target.value))}>
              {priceSelectOptions}
            </select>
          </label>
          <label className="f">
            GLSL file
            <input
              className="field"
              type="file"
              accept=".glsl,.frag,.txt"
              onChange={(event) => setChosenFileName(event.target.files?.[0]?.name ?? '')}
            />
          </label>
          <p className="earn-line">
            You earn <span className="earn">${perSaleEarnings}</span> per sale
          </p>
          <button className="neon-btn" type="submit">
            Submit for review
          </button>
          <p className="status" role="status">
            {formStatus}
          </p>
        </form>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Earnings</h2>
            <span className="chip">Example data</span>
          </div>
          <div className="stats">
            <div>
              <b>$412.30</b>
              <span>This month</span>
            </div>
            <div>
              <b>118</b>
              <span>Sales</span>
            </div>
            <div>
              <b>$3.49</b>
              <span>Average payout</span>
            </div>
          </div>
          <div className="bars" role="img" aria-label="Weekly earnings for eight weeks, rising from 38 to 88 dollars">
            {weeklyBars}
          </div>
          <div className="axis">{weekAxisLabels}</div>
          <div className="scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Top shaders</th>
                  <th>Price</th>
                  <th>Sales</th>
                  <th>Earned</th>
                </tr>
              </thead>
              <tbody>{topShaderRows}</tbody>
            </table>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  )
}
