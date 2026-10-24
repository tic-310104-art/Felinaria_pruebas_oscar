import { ArrowLeft, CookingPot } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/ui/PageMeta'

export default function NotFoundPage() {
  return <div className="container not-found"><PageMeta title="Página no encontrada" description="Esta página no está en nuestro recetario. Vuelve a Fierro 40k para encontrar algo rico que cocinar." /><span className="eyebrow accent-text">ERROR 404 · FUERA DEL RECETARIO</span><div className="not-found-art" aria-hidden="true">4<CookingPot strokeWidth={0.9} />4</div><h1>Parece que falta<br /><em>un ingrediente.</em></h1><p>La página que buscas no existe o cambió de lugar.<br />Volvamos a la cocina.</p><Link className="button button-primary" to="/"><ArrowLeft size={18} aria-hidden="true" />Regresar al inicio</Link></div>
}
