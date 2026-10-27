// Tests that makeReactExport fills the template and keeps GLSL intact.
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { makeReactExport } from './makeReactExport'
import { shaders } from '../shader-catalog'

describe('makeReactExport', () => {
  for (const shader of shaders) {
    const values = Object.fromEntries(shader.uniforms.map((c) => [c.name, c.default]))
    const { usage, component } = makeReactExport(shader, values)

    it(`${shader.id}: usage lists every control with its value`, () => {
      expect(usage).toContain(`shader="${shader.id}"`)
      for (const c of shader.uniforms) {
        const v = typeof c.default === 'string' ? `'${c.default}'` : String(c.default)
        expect(usage).toContain(`${c.name}: ${v},`)
      }
    })

    it(`${shader.id}: component has the shader filled in and no leftover markers`, () => {
      expect(component).toContain(`'${shader.id}': {`)
      expect(component).not.toContain('__SHADERS__')
      expect(component).toContain('gl_Position')
    })

    it(`${shader.id}: component is syntactically valid TSX and keeps the GLSL intact`, () => {
      const out = ts.transpileModule(component, {
        reportDiagnostics: true,
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
        fileName: 'ShaderXD.tsx',
      })
      expect(out.diagnostics ?? []).toEqual([])
      expect(out.outputText).toContain('uniform float u_time;')
    })
  }

  it('reflects changed values', () => {
    const shader = shaders[0]
    const colorUniform = shader.uniforms.find((c) => c.kind === 'color')
    const colorName = colorUniform?.name ?? 'u_color'
    const { usage } = makeReactExport(shader, { [colorName]: '#00ff00', u_speed: 2.5 })
    expect(usage).toContain(`${colorName}: '#00ff00',`)
    expect(usage).toContain('u_speed: 2.5,')
  })
})
