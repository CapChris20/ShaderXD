// Tests for reading GLSL uniforms into UI controls.
import { describe, expect, it } from 'vitest'
import { hexToRgb, readUniforms } from './readUniforms'

describe('readUniforms', () => {
  it('maps float to a slider with annotated range and default', () => {
    const [control] = readUniforms(
      'uniform float u_speed; // min=0 max=6 step=0.05 default=1.4 label="Camera speed"',
    )
    expect(control).toEqual({
      kind: 'slider',
      name: 'u_speed',
      label: 'Camera speed',
      min: 0,
      max: 6,
      step: 0.05,
      default: 1.4,
    })
  })

  it('falls back to 0..1 and a humanized label when unannotated', () => {
    const [control] = readUniforms('uniform float u_glow_amount;')
    expect(control).toEqual({
      kind: 'slider',
      name: 'u_glow_amount',
      label: 'Glow amount',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0,
    })
  })

  it('maps vec3 with "color" in the name to a color picker', () => {
    const [control] = readUniforms('uniform vec3 u_sun_color; // default=#FFB02E')
    expect(control).toEqual({
      kind: 'color',
      name: 'u_sun_color',
      label: 'Sun color',
      default: '#ffb02e',
    })
  })

  it('accepts a vec3 flagged `color` and defaults to white on a bad hex', () => {
    const [control] = readUniforms('uniform vec3 u_tint; // color default=nope')
    expect(control).toMatchObject({ kind: 'color', default: '#ffffff' })
  })

  it('skips a vec3 that is not a color', () => {
    expect(readUniforms('uniform vec3 u_direction;')).toEqual([])
  })

  it('maps bool to a toggle', () => {
    const [control] = readUniforms('uniform bool u_stripes; // default=true')
    expect(control).toEqual({
      kind: 'toggle',
      name: 'u_stripes',
      label: 'Stripes',
      default: true,
    })
    expect(readUniforms('uniform bool u_x;')[0]).toMatchObject({ default: false })
  })

  it('ignores built-ins, unsupported types, commented-out and block-commented uniforms, and duplicates', () => {
    const source = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform sampler2D u_tex;
      uniform int u_count;
      // uniform float u_old;
      /* uniform float u_blocked; */
      uniform highp float u_a;
      uniform float u_a; // max=9
    `
    expect(readUniforms(source).map((c) => c.name)).toEqual(['u_a'])
  })

  it('keeps declaration order and tolerates extra whitespace', () => {
    const source = '  uniform   float   u_b ;\nuniform vec3 u_color;\nuniform float u_c;'
    expect(readUniforms(source).map((c) => c.name)).toEqual(['u_b', 'u_color', 'u_c'])
  })
})

describe('hexToRgb', () => {
  it('converts hex to 0..1 channels', () => {
    expect(hexToRgb('#ff0000')).toEqual([1, 0, 0])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })
})
