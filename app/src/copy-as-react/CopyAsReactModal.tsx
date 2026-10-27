// Modal that shows the React usage snippet or full ShaderXD.tsx and copies it.
// Flow: open → focus close → Esc/backdrop closes → Copy writes clipboard.
// Used by: WebsiteApp (and the old standalone sandbox).

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { makeReactExport } from './makeReactExport'
import type { ParamValues, ShaderDef } from '../shader-catalog/types'

type Props = {
  open: boolean
  shader: ShaderDef
  values: ParamValues
  onClose: () => void
}

type Tab = 'usage' | 'component'
type CopyStatus = 'ok' | 'fail' | null

// ===== NAMED CONSTANTS =====

const COPY_STATUS_CLEAR_MS = 1800
const BACKDROP_FADE_SECONDS = 0.15

// ===== MAIN FUNCTION =====

/**
 * Export-as-React dialog. Same preview values become the snippet.
 */
export function CopyAsReactModal({ open, shader, values, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('usage')
  const [copied, setCopied] = useState<CopyStatus>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const code = useMemo(() => makeReactExport(shader, values), [shader, values])

  const textForTab = tab === 'usage' ? code.usage : code.component
  const hintForTab =
    tab === 'usage'
      ? 'Drop this where you want the effect. It fills its parent, so give the parent a size.'
      : 'Save as ShaderXD.tsx. Needs three, @react-three/fiber and @react-three/postprocessing.'

  // Focus close and listen for Escape while open.
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Clear the "Copied" status after a short delay.
  useEffect(() => {
    if (!copied) return
    const timeoutId = window.setTimeout(() => setCopied(null), COPY_STATUS_CLEAR_MS)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  /**
   * Copy the active tab's text to the clipboard.
   * Flow: 1. write text  2. mark ok or fail
   */
  async function handleCopy() {
    // 1. Ask the browser to write the snippet.
    try {
      await navigator.clipboard.writeText(textForTab)
      setCopied('ok')
    } catch {
      // 2. Clipboard blocked — tell the user to copy by hand.
      setCopied('fail')
    }
  }

  const isUsageTab = tab === 'usage'
  const isComponentTab = tab === 'component'
  const copiedOkMessage = copied === 'ok' ? 'Copied to clipboard' : null
  const copiedFailMessage =
    copied === 'fail' ? 'Copy blocked by the browser. Select the code and copy manually.' : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: BACKDROP_FADE_SECONDS }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h2 id="export-title">Export as React</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="ghost icon"
                aria-label="Close"
                onClick={onClose}
              >
                ×
              </button>
            </header>

            <div className="tabs" role="tablist">
              <button
                role="tab"
                aria-selected={isUsageTab}
                className={isUsageTab ? 'on' : ''}
                onClick={() => setTab('usage')}
              >
                Usage
              </button>
              <button
                role="tab"
                aria-selected={isComponentTab}
                className={isComponentTab ? 'on' : ''}
                onClick={() => setTab('component')}
              >
                ShaderXD.tsx
              </button>
            </div>

            <p className="hint">{hintForTab}</p>

            <pre tabIndex={0} aria-label="Generated code">
              <code data-testid="export-code">{textForTab}</code>
            </pre>

            <footer>
              <span role="status" className="status">
                {copiedOkMessage}
                {copiedFailMessage}
              </span>
              <button type="button" className="primary" onClick={handleCopy}>
                Copy
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
