// One registration for the document lifetime, including React StrictMode remounts.
let started = false
let registration
let reloadApproved = false
const listeners = new Set()
let state = { offlineReady: false, updateAvailable: false, reloadPending: false, error: '', updating: false }

function publish(patch) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export const getPwaState = () => state
export function subscribePwa(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function dismissOfflineReady() {
  publish({ offlineReady: false })
}

export function startPwa() {
  if (started || !import.meta.env.PROD || !window.isSecureContext || !('serviceWorker' in navigator)) return
  started = true
  const hadController = Boolean(navigator.serviceWorker.controller)
  let controller = navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const previous = controller
    controller = navigator.serviceWorker.controller
    // Ignore the first installation claiming this page. A later controller
    // change can originate in any tab, including one opened before installation.
    if (!previous || previous === controller) return
    if (reloadApproved) window.location.reload()
    else publish({ updateAvailable: true, reloadPending: true, updating: false })
  })
  const register = async () => {
    try {
      registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: 'none',
      })
      const checkWaiting = () => {
        if (registration.waiting && navigator.serviceWorker.controller) publish({ updateAvailable: true, error: '' })
      }
      const watchInstalling = () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          checkWaiting()
          if (worker.state === 'activated' && !hadController && !state.updateAvailable) publish({ offlineReady: true, error: '' })
        })
      }
      registration.addEventListener('updatefound', watchInstalling)
      watchInstalling()
      checkWaiting()
      let lastCheck = Date.now()
      const check = () => {
        if (!navigator.onLine || document.visibilityState === 'hidden'
          || registration.installing || Date.now() - lastCheck < 60 * 60 * 1000) return
        lastCheck = Date.now()
        registration.update().catch(() => { /* Keep the current working version. */ })
      }
      window.setInterval(check, 60 * 60 * 1000)
      window.addEventListener('online', check)
      window.addEventListener('focus', check)
      document.addEventListener('visibilitychange', check)
    } catch {
      publish({ error: 'No se pudo preparar el modo sin conexión. Comprueba la conexión y vuelve a abrir la aplicación.' })
    }
  }
  // Download and install the offline shell after the initial page has loaded.
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}

export function applyPwaUpdate() {
  reloadApproved = true
  publish({ updating: true, error: '' })
  try {
    // Another tab may already have activated the new worker. Only reload this
    // document after its own user's confirmation, never on another tab's behalf.
    if (state.reloadPending || !registration?.waiting) window.location.reload()
    else registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  } catch {
    reloadApproved = false
    publish({ updating: false, error: 'No se pudo actualizar. Puedes volver a intentarlo; tu versión actual sigue disponible.' })
  }
}
