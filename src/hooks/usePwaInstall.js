import { useEffect, useState } from 'react'

export function usePwaInstall() {
  const [prompt, setPrompt] = useState(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)')
    const beforeInstall = (event) => {
      if (standalone.matches || navigator.standalone) return
      event.preventDefault()
      setPrompt(event)
    }
    const installed = () => setPrompt(null)
    const displayChanged = () => { if (standalone.matches) installed() }
    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', installed)
    standalone.addEventListener('change', displayChanged)
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', installed)
      standalone.removeEventListener('change', displayChanged)
    }
  }, [])

  async function install() {
    if (!prompt || installing) return
    setInstalling(true)
    // An install event can only be used once, even when dismissed.
    setPrompt(null)
    try {
      await prompt.prompt()
      await prompt.userChoice
    } catch {
      // The native browser menu remains available if its prompt has expired.
    } finally {
      setInstalling(false)
    }
  }

  return { canInstall: Boolean(prompt), installing, install }
}
