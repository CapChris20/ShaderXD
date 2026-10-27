// Full-window bare shader for `?bare&shader=<id>` embeds and thumbnails.
// Flow: look up shader → fill the window with ShaderView at defaults.
// Used by: main.tsx when the URL has ?bare.

import { ShaderView } from '../copy-as-react/shaderViewTemplate'
import { defaultsOf, getShader } from '../shader-catalog'

/**
 * `?bare&shader=<id>`: just the shader filling the window.
 */
export default function FullWindowPreview({ id }: { id: string | null }) {
  const shaderId = id ?? ''
  const shader = getShader(shaderId)
  const defaultParams = defaultsOf(shader)

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <ShaderView fragment={shader.fragment} params={defaultParams} bloom={shader.bloom} />
    </div>
  )
}
