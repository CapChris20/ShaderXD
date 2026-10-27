// Per-letter spring reveal with hover wobble for marketing headlines.
// Flow: build accessible label → reduced-motion plain text OR motion spans with stagger.
// Used by: landing sections that mix display and serif line segments.

import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

// ===== NAMED CONSTANTS =====

const KINETIC_TEXT_ROOT_CLASS = 'kt'
const KINETIC_LINE_CLASS = 'kt-line'
const KINETIC_WORD_CLASS = 'kt-word'
const KINETIC_CHAR_CLASS = 'kt-ch'

const LETTER_HIDDEN_Y = '115%'
const LETTER_HIDDEN_ROTATE = 9
const LETTER_SPRING_STIFFNESS = 240
const LETTER_SPRING_DAMPING = 20
const HOVER_LIFT_Y = -6
const HOVER_SKEW_X = -10
const HOVER_DURATION_SECONDS = 0.12
const VIEWPORT_REVEAL_AMOUNT = 0.5
const DEFAULT_STAGGER_SECONDS = 0.028

const WHITESPACE_SPLIT_PATTERN = /(\s+)/
const IS_WHITESPACE_ONLY = /^\s+$/

// ===== TYPES =====

export type Segment = { t: string; cls?: string }

type KineticTextProps = {
  lines: Segment[][]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  /** 'view' reveals on scroll into view once; 'mount' plays whenever the element (re)mounts. */
  trigger?: 'view' | 'mount'
  delay?: number
  stagger?: number
}

type BuiltCharacter = { character: string; staggerIndex: number }
type BuiltWord = { kind: 'word'; characters: BuiltCharacter[]; segmentClassName: string }
type BuiltSpace = { kind: 'space' }
type BuiltToken = BuiltWord | BuiltSpace
type BuiltLine = { tokens: BuiltToken[] }

// ===== NAMED CONSTANTS (MOTION) =====

const letterSpringVariants: Variants = {
  hidden: { y: LETTER_HIDDEN_Y, rotate: LETTER_HIDDEN_ROTATE, opacity: 0 },
  show: (staggerIndex: number) => ({
    y: 0,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: LETTER_SPRING_STIFFNESS,
      damping: LETTER_SPRING_DAMPING,
      delay: staggerIndex,
    },
  }),
}

// ===== HELPER FUNCTIONS =====

function buildAccessibleLabel(lines: Segment[][]) {
  const lineTexts: string[] = []
  for (const segments of lines) {
    let lineText = ''
    for (const segment of segments) {
      lineText += segment.t
    }
    lineTexts.push(lineText)
  }
  return lineTexts.join(' ')
}

/**
 * Walk every letter once and assign its stagger delay up front.
 * Flow: 1. split segments into words/spaces  2. number each character  3. return built lines
 */
function buildLinesWithStagger(lines: Segment[][], delay: number, staggerStep: number): BuiltLine[] {
  const builtLines: BuiltLine[] = []
  let letterNumber = 0

  for (const segments of lines) {
    const tokens: BuiltToken[] = []

    for (const segment of segments) {
      const pieces = segment.t.split(WHITESPACE_SPLIT_PATTERN)
      for (const piece of pieces) {
        if (IS_WHITESPACE_ONLY.test(piece)) {
          tokens.push({ kind: 'space' })
          continue
        }

        const characters: BuiltCharacter[] = []
        for (const character of piece) {
          characters.push({
            character,
            staggerIndex: delay + staggerStep * letterNumber,
          })
          letterNumber += 1
        }
        tokens.push({
          kind: 'word',
          characters,
          segmentClassName: segment.cls ?? '',
        })
      }
    }

    builtLines.push({ tokens })
  }

  return builtLines
}

function KineticCharacter({ character, staggerIndex }: BuiltCharacter) {
  return (
    <motion.span
      className={KINETIC_CHAR_CLASS}
      custom={staggerIndex}
      variants={letterSpringVariants}
      whileHover={{
        y: HOVER_LIFT_Y,
        skewX: HOVER_SKEW_X,
        transition: { duration: HOVER_DURATION_SECONDS },
      }}
    >
      {character}
    </motion.span>
  )
}

function KineticWord({ characters, segmentClassName }: BuiltWord) {
  const wordClassName = `${KINETIC_WORD_CLASS} ${segmentClassName}`.trim()
  return (
    <span className={wordClassName}>
      {characters.map((entry, characterIndex) => (
        <KineticCharacter
          key={characterIndex}
          character={entry.character}
          staggerIndex={entry.staggerIndex}
        />
      ))}
    </span>
  )
}

// ===== MAIN FUNCTION =====

/**
 * Per-letter spring reveal with a hover wobble. Lines/segments let you mix display and serif styles.
 */
export function KineticText({
  lines,
  as = 'h2',
  className = '',
  trigger = 'view',
  delay = 0,
  stagger = DEFAULT_STAGGER_SECONDS,
}: KineticTextProps) {
  const prefersReducedMotion = useReducedMotion()
  const accessibleLabel = buildAccessibleLabel(lines)
  const MotionTag = motion[as]
  const rootClassName = `${KINETIC_TEXT_ROOT_CLASS} ${className}`.trim()

  // 1. Prefer a plain heading when the user asks for less motion.
  if (prefersReducedMotion) {
    const PlainTag = as
    return <PlainTag className={rootClassName}>{accessibleLabel}</PlainTag>
  }

  // 2. Precompute every letter's delay so render does not mutate counters.
  const builtLines = buildLinesWithStagger(lines, delay, stagger)

  // 3. Reveal on scroll into view, or immediately on mount.
  const revealProps =
    trigger === 'view'
      ? { whileInView: 'show' as const, viewport: { once: true, amount: VIEWPORT_REVEAL_AMOUNT } }
      : { animate: 'show' as const }

  return (
    <MotionTag className={rootClassName} initial="hidden" aria-label={accessibleLabel} {...revealProps}>
      {builtLines.map((line, lineIndex) => (
        <span className={KINETIC_LINE_CLASS} key={lineIndex} aria-hidden>
          {line.tokens.map((token, tokenIndex) => {
            if (token.kind === 'space') {
              return <span key={tokenIndex}>{' '}</span>
            }
            return (
              <KineticWord
                key={tokenIndex}
                kind="word"
                characters={token.characters}
                segmentClassName={token.segmentClassName}
              />
            )
          })}
        </span>
      ))}
    </MotionTag>
  )
}
