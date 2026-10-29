import { useEffect, useState, useSyncExternalStore } from 'react'
import { Download, RefreshCw, WifiOff, X } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { applyPwaUpdate, dismissOfflineReady, getPwaState, startPwa, subscribePwa } from '../../pwa'

export default function PwaControls() {
  const online = useOnlineStatus()
  const { canInstall, installing, install } = usePwaInstall()
  const { offlineReady, updateAvailable, reloadPending, error, updating } = useSyncExternalStore(subscribePwa, getPwaState)
  const [postponed, setPostponed] = useState(false)
  useEffect(() => { startPwa() }, [])

  return (
    <aside className="pwa-controls no-print" aria-label="Aplicación y conexión">
      <div className="pwa-messages">
        {!online && <p className="pwa-status" role="status"><WifiOff size={18} aria-hidden="true" />Sin conexión. Puedes consultar las recetas; solo se mostrarán las fotos guardadas.</p>}
        {online && offlineReady && !updateAvailable && (
          <div className="pwa-status" role="status">
            <p>Recetas y fotografías listas sin conexión.</p>
            <button className="icon-button" aria-label="Cerrar aviso sin conexión" onClick={dismissOfflineReady}><X size={18} aria-hidden="true" /></button>
          </div>
        )}
        {error && <p className="pwa-status" role="status">{error}</p>}
        {updateAvailable && !postponed && (
          <div className="pwa-update">
            <p role="status">{reloadPending ? 'La nueva versión ya está disponible. Recarga cuando termines.' : 'Hay una nueva versión disponible. Actualiza cuando termines.'}</p>
            <div className="pwa-actions">
              <button className="button button-primary" onClick={applyPwaUpdate} disabled={updating}><RefreshCw size={16} aria-hidden="true" />{updating ? 'Actualizando…' : 'Actualizar'}</button>
              <button className="text-button" onClick={() => setPostponed(true)} disabled={updating}>Más tarde</button>
            </div>
          </div>
        )}
        {updateAvailable && postponed && <button className="text-button pwa-update-reminder" onClick={() => setPostponed(false)}>Nueva versión disponible</button>}
      </div>
      {canInstall && <button className="button button-outline pwa-install" onClick={install} disabled={installing}><Download size={18} aria-hidden="true" />Instalar Fierro 40k</button>}
    </aside>
  )
}
