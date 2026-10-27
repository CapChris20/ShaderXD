// PickAPlan tiers, comparison table, and FAQ for prototype plans.
// Flow: page band → tier cards → feature table → expandable questions.
// Used by: WebsiteApp when the route is `pricing`.

import { SiteFooter } from '../top-bar-and-footer/SiteFooter'
import { PageHeader } from '../top-bar-and-footer/PageHeader'
import { SplitFlapBackground } from '../visual-effects/backgrounds/SplitFlapBackground'

// ===== NAMED CONSTANTS =====

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    per: '',
    items: ['Browse 10 shaders', 'Live read-only previews'],
    cta: 'Start free',
    hot: false,
  },
  {
    name: 'Creator',
    price: '$5',
    per: '/ month',
    items: ['50+ shaders', 'Export to React, Vue, JavaScript and npm', 'Collaborative editing'],
    cta: 'Choose Creator',
    hot: true,
  },
  {
    name: 'Pro',
    price: '$29',
    per: '/ month',
    items: ['Unlimited shaders', 'Upload and sell your own shaders', 'Earnings dashboard'],
    cta: 'Choose Pro',
    hot: false,
  },
] as const

const COMPARE_ROWS: [string, string, string, string][] = [
  ['Shaders you can browse', '10', '50+', 'Unlimited'],
  ['Live previews', 'Yes', 'Yes', 'Yes'],
  ['Export code', 'No', 'Yes', 'Yes'],
  ['Collaborative editing', 'No', 'Yes', 'Yes'],
  ['Upload your own shaders', 'No', 'No', 'Yes'],
  ['Marketplace and earnings dashboard', 'No', 'No', 'Yes'],
]

const FAQ_ITEMS: [string, string][] = [
  ['Do I need to know GLSL?', 'No. Every shader exposes its settings as colour pickers and sliders, and the export gives you ready-to-paste code.'],
  ['Which frameworks can I export to?', 'React works in this prototype. Vue, Svelte, plain JavaScript and an npm package are planned.'],
  ['How do creators get paid?', 'Pro members upload shaders to the marketplace and keep 70% of each sale, paid out weekly.'],
  ['What does the free plan include?', 'You can browse 10 shaders with live previews. Exporting code needs a Creator or Pro plan.'],
]

// ===== MAIN FUNCTION =====

export function PickAPlan() {
  const tierCards = TIERS.map((tier) => {
    const cardClass = tier.hot ? 'tier hot' : 'tier'
    const ctaClass = tier.hot ? 'neon-btn' : 'ghost-btn'
    const featureItems = tier.items.map((item) => <li key={item}>{item}</li>)

    return (
      <div key={tier.name} className={cardClass}>
        <h3>{tier.name}</h3>
        <div className="price">
          {tier.price} <small>{tier.per}</small>
        </div>
        <ul>{featureItems}</ul>
        <a href="#signup" className={ctaClass}>
          {tier.cta}
        </a>
      </div>
    )
  })

  const compareBodyRows = COMPARE_ROWS.map((row) => (
    <tr key={row[0]}>
      {row.map((cell, columnIndex) => (
        <td key={columnIndex}>{cell}</td>
      ))}
    </tr>
  ))

  const faqEntries = FAQ_ITEMS.map(([question, answer], index) => (
    <details key={question} open={index === 0}>
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  ))

  return (
    <>
      <PageHeader
        bg={<SplitFlapBackground />}
        title="Simple"
        accent="pricing"
        sub="Start free. Upgrade when you need to export code or sell your own shaders."
      />
      <section className="page-sec">
        <p className="note">Prototype pricing: plans are mock-ups and nothing is charged.</p>
        <div className="tiers">{tierCards}</div>
        <p className="muted center">SellShaders keep 70% of every marketplace sale.</p>

        <h2 className="page-h2">Compare plans</h2>
        <div className="panel scroll">
          <table className="tbl wide">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Creator</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>{compareBodyRows}</tbody>
          </table>
        </div>

        <h2 className="page-h2">Questions</h2>
        <div className="faq">{faqEntries}</div>
      </section>
      <SiteFooter />
    </>
  )
}
