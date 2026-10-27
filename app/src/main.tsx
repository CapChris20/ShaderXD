// App entry: fonts → styles → bare embed or the multi-page site.
// Flow: read ?bare → mount FullWindowPreview or WebsiteApp inside StrictMode.
// Used by: index.html.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/bricolage-grotesque/400.css'
import '@fontsource/bricolage-grotesque/700.css'
import '@fontsource/bricolage-grotesque/800.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles.css'
import FullWindowPreview from './live-sandbox/FullWindowPreview.tsx'
import WebsiteApp from './website/WebsiteApp.tsx'

const query = new URLSearchParams(window.location.search)
const isBareEmbed = query.has('bare')
const bareShaderId = query.get('shader')
const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    {isBareEmbed ? <FullWindowPreview id={bareShaderId} /> : <WebsiteApp />}
  </StrictMode>,
)
