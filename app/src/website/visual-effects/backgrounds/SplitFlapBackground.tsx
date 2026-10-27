// Airport-style split-flap board that cycles plan names and prices with CSS 3D flips.
// Flow: rotate message set on interval → each character flips through charset to target.
// Used by: pricing backdrop that mimics a mechanical departure board.

import { useEffect, useState } from 'react'

// ===== NAMED CONSTANTS =====

const FLAP_CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%/.'
const BOARD_COLUMN_COUNT = 12

const MESSAGE_ROTATION_MS = 7000

const FLAP_BASE_DELAY_MS = 48
const FLAP_RANDOM_DELAY_MS = 30
const FLAP_LONG_ROUTE_SKIP = 10

const COLUMN_STAGGER_MS = 45
const ROW_STAGGER_MS = 120

const FLAP_WRAPPER_CLASS = 'flap'
const FLAP_TOP_CLASS = 'fl top'
const FLAP_BOTTOM_CLASS = 'fl bot'
const FLAP_TOP_FLIP_CLASS = 'fl top flip-top'
const FLAP_BOTTOM_FLIP_CLASS = 'fl bot flip-bot'

const BOARD_ROOT_CLASS = 'flapboard'
const BOARD_ROW_CLASS = 'flaprow'

const PLAN_MESSAGES = [
  ['SIMPLE PRICE', 'FREE     $0', '10 SHADERS'],
  ['CREATOR', '$5 PER MONTH', 'EXPORT CODE'],
  ['PRO', '$29 PER MONTH', 'SELL YOUR OWN'],
  ['KEEP 70%', 'OF EVERY SALE', 'PAID WEEKLY'],
].map((rows) => rows.map((row) => row.padEnd(BOARD_COLUMN_COUNT, ' ').slice(0, BOARD_COLUMN_COUNT)))

// ===== HELPER FUNCTIONS =====

type SplitFlapCharacterProps = {
  targetCharacter: string
  startDelayMs: number
}

function SplitFlapCharacter({ targetCharacter, startDelayMs }: SplitFlapCharacterProps) {
  const [currentCharacter, setCurrentCharacter] = useState(' ')
  const [previousCharacter, setPreviousCharacter] = useState(' ')
  const [flipTick, setFlipTick] = useState(0)

  useEffect(() => {
    if (currentCharacter === targetCharacter) return

    const charsetLength = FLAP_CHARSET.length
    const currentIndex = FLAP_CHARSET.indexOf(currentCharacter)
    const targetIndex = FLAP_CHARSET.indexOf(targetCharacter)
    const stepsForward = (targetIndex - currentIndex + charsetLength) % charsetLength

    const delayMs = flipTick === 0 ? startDelayMs : FLAP_BASE_DELAY_MS + Math.random() * FLAP_RANDOM_DELAY_MS

    const timeoutId = window.setTimeout(() => {
      if (stepsForward > FLAP_LONG_ROUTE_SKIP) {
        setCurrentCharacter(FLAP_CHARSET[(targetIndex - FLAP_LONG_ROUTE_SKIP + charsetLength) % charsetLength])
        return
      }
      setPreviousCharacter(currentCharacter)
      setCurrentCharacter(FLAP_CHARSET[(currentIndex + 1) % charsetLength])
      setFlipTick((tick) => tick + 1)
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [currentCharacter, targetCharacter, startDelayMs, flipTick])

  return (
    <span className={FLAP_WRAPPER_CLASS}>
      <span className={FLAP_TOP_CLASS}>{currentCharacter}</span>
      <span className={FLAP_BOTTOM_CLASS}>{previousCharacter}</span>
      <span key={`top-${flipTick}`} className={FLAP_TOP_FLIP_CLASS}>
        {previousCharacter}
      </span>
      <span key={`bottom-${flipTick}`} className={FLAP_BOTTOM_FLIP_CLASS}>
        {currentCharacter}
      </span>
    </span>
  )
}

// ===== MAIN FUNCTION =====

/** Split-flap: an airport-style board that flips through the plan names and prices. DOM + CSS 3D, no shader. */
export function SplitFlapBackground() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((previous) => (previous + 1) % PLAN_MESSAGES.length)
    }, MESSAGE_ROTATION_MS)
    return () => window.clearInterval(intervalId)
  }, [])

  const activeRows = PLAN_MESSAGES[messageIndex]

  return (
    <div className={BOARD_ROOT_CLASS} aria-hidden>
      {activeRows.map((rowText, rowIndex) => (
        <div className={BOARD_ROW_CLASS} key={rowIndex}>
          {[...rowText].map((character, columnIndex) => (
            <SplitFlapCharacter
              key={columnIndex}
              targetCharacter={character}
              startDelayMs={columnIndex * COLUMN_STAGGER_MS + rowIndex * ROW_STAGGER_MS}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
