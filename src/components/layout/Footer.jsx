import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SpaceMarineHelmetIcon from '../ui/SpaceMarineHelmetIcon'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Link to="/" className="brand" aria-label="Fierro 40k, inicio"><SpaceMarineHelmetIcon size={25} />Fierro 40k</Link>
            <p>Buenos ingredientes.<br />Momentos que se quedan.</p>
          </div>
          <nav aria-label="Navegación del pie de página">
            <Link to="/recetas">Explorar recetas <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link to="/favoritos">Mis favoritos <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </nav>
          <div className="footer-note">
            <span className="eyebrow">DE NUESTRA COCINA A LA TUYA</span>
            <p>Disfruta el proceso.<br />Comparte el resultado.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Fierro 40k · El gusto de cocinar.</span>
          <span>Hecho para cocinar a tu ritmo.</span>
        </div>
      </div>
    </footer>
  )
}
