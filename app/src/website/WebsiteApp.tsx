// Root layout for the ShaderXD marketing site and sandbox entry.
// Flow: track hash route → hold shared shader param state → render page + export modal.
// Used by: app entry that mounts the public site.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CopyAsReactModal } from '../copy-as-react/CopyAsReactModal'
import { defaultsOf, getShader, shaders } from '../shader-catalog'
import type { ParamValue, ParamValues } from '../shader-catalog/types'
import { TopBar } from './top-bar-and-footer/TopBar'
import { SellShaders } from './sell-shaders/SellShaders'
import { BrowseShaders } from './browse-shaders/BrowseShaders'
import { Landing } from './landing/Landing'
import { PickAPlan } from './pick-a-plan/PickAPlan'
import { OpenLiveSandbox } from './sandbox-page/OpenLiveSandbox'
import { MakeAccount } from './make-account/MakeAccount'
import { goToPage, useGoToPage } from './go-to-page/useGoToPage'
import './site.css'

// ===== NAMED CONSTANTS =====

const PAGE_TITLES = {
  home: 'ShaderXD',
  discover: 'Discover · ShaderXD',
  sandbox: 'Sandbox · ShaderXD',
  creators: 'Creators · ShaderXD',
  pricing: 'Pricing · ShaderXD',
  signup: 'Sign up · ShaderXD',
} as const

// ===== MAIN FUNCTION =====

export default function WebsiteApp() {
  const activeRoute = useGoToPage()
  const [selectedShaderId, setSelectedShaderId] = useState(shaders[0].id)
  const [valuesByShaderId, setValuesByShaderId] = useState<Record<string, ParamValues>>({})
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const activeShader = useMemo(() => getShader(selectedShaderId), [selectedShaderId])
  const mergedParamValues = useMemo(
    () => ({ ...defaultsOf(activeShader), ...valuesByShaderId[activeShader.id] }),
    [activeShader, valuesByShaderId],
  )

  useEffect(() => {
    // 1. Keep the browser tab title in sync with the active page.
    document.title = PAGE_TITLES[activeRoute]
  }, [activeRoute])

  const setParamValue = useCallback(
    (uniformName: string, nextValue: ParamValue) => {
      setValuesByShaderId((previous) => ({
        ...previous,
        [activeShader.id]: { ...previous[activeShader.id], [uniformName]: nextValue },
      }))
    },
    [activeShader.id],
  )

  const resetParamsForShader = useCallback(() => {
    setValuesByShaderId((previous) => ({ ...previous, [activeShader.id]: {} }))
  }, [activeShader.id])

  const openSandboxWithShader = useCallback((shaderId: string) => {
    // 1. Select the shader the user clicked.
    setSelectedShaderId(shaderId)
    // 2. Switch to the sandbox route.
    goToPage('sandbox')
  }, [])

  const closeExportModal = useCallback(() => setExportModalOpen(false), [])
  const openExportModal = useCallback(() => setExportModalOpen(true), [])

  const homeView = activeRoute === 'home' ? <Landing onOpen={openSandboxWithShader} /> : null
  const discoverView = activeRoute === 'discover' ? <BrowseShaders onOpen={openSandboxWithShader} /> : null
  const sandboxView =
    activeRoute === 'sandbox' ? (
      <OpenLiveSandbox
        shader={activeShader}
        values={mergedParamValues}
        onSelect={setSelectedShaderId}
        onChange={setParamValue}
        onReset={resetParamsForShader}
        onExport={openExportModal}
      />
    ) : null
  const creatorsView = activeRoute === 'creators' ? <SellShaders /> : null
  const pricingView = activeRoute === 'pricing' ? <PickAPlan /> : null
  const signupView = activeRoute === 'signup' ? <MakeAccount /> : null

  return (
    <div className="site">
      <TopBar route={activeRoute} />
      <main key={activeRoute} className="view">
        {homeView}
        {discoverView}
        {sandboxView}
        {creatorsView}
        {pricingView}
        {signupView}
      </main>
      <CopyAsReactModal open={exportModalOpen} shader={activeShader} values={mergedParamValues} onClose={closeExportModal} />
    </div>
  )
}
