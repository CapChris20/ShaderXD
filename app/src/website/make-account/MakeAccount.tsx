// Prototype sign-up form with plan picker (no real account creation).
// Flow: validate email and password → show prototype status message.
// Used by: WebsiteApp when the route is `signup`.

import { useState } from 'react'
import type { FormEvent } from 'react'
import { SiteFooter } from '../top-bar-and-footer/SiteFooter'
import { PageHeader } from '../top-bar-and-footer/PageHeader'
import { GradientMeshBackground } from '../visual-effects/backgrounds/GradientMeshBackground'

// ===== NAMED CONSTANTS =====

const MIN_PASSWORD_LENGTH = 8
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const PLAN_OPTIONS = ['Free', 'Creator, $5 per month', 'Pro, $29 per month'] as const

// ===== HELPER FUNCTIONS =====

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value)
}

// ===== MAIN FUNCTION =====

export function MakeAccount() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>(PLAN_OPTIONS[0])
  const [formStatus, setFormStatus] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    // 1. Validate email shape.
    if (!isValidEmail(email)) {
      setFormStatus('Enter a valid email address.')
      return
    }

    // 2. Enforce minimum password length.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormStatus('Use a password of at least 8 characters.')
      return
    }

    // 3. Prototype-only confirmation (no backend).
    setFormStatus(`Prototype only: no account was created. You would be starting on the ${selectedPlan} plan.`)
  }

  const planSelectOptions = PLAN_OPTIONS.map((planLabel) => <option key={planLabel}>{planLabel}</option>)

  return (
    <>
      <PageHeader
        bg={<GradientMeshBackground />}
        title="Create your"
        accent="account"
        sub="Start on the free plan. You can upgrade at any time."
      />
      <section className="page-sec narrow">
        <form className="panel" onSubmit={handleSubmit} noValidate>
          <label className="f">
            Email
            <input
              className="field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="f">
            Password
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          <label className="f">
            Plan
            <select className="field" value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)}>
              {planSelectOptions}
            </select>
          </label>
          <button className="neon-btn" type="submit">
            Create account
          </button>
          <p className="status" role="status">
            {formStatus}
          </p>
        </form>
      </section>
      <SiteFooter />
    </>
  )
}
