import { useEffect, useRef, useState } from 'react'
import { Heart, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useSavora } from '../../hooks/useSavora'
import SpaceMarineHelmetIcon from '../ui/SpaceMarineHelmetIcon'

const links = [{ to: '/', label: 'Inicio' }, { to: '/recetas', label: 'Recetas' }]

export default function Header() {
  const { favorites } = useSavora()
  const [open, setOpen] = useState(false)
  const toggle = useRef(null)
  const header = useRef(null)

  useEffect(() => {
    if (!open) return
    const escape = (event) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
    }
    const outside = (event) => {
      if (!header.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', escape)
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    return () => {
      document.removeEventListener('keydown', escape)
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
    }
  }, [open])

  return (
    <header className="site-header" ref={header}>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Fierro 40k, inicio">
          <SpaceMarineHelmetIcon size={26} />
          Fierro 40k
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <NavLink to="/favoritos" className="favorites-link" aria-label={`Mis favoritos, ${favorites.length} recetas guardadas`}>
            <Heart size={18} aria-hidden="true" />
            <span>Mis favoritos</span>
            <span className="favorite-count" aria-hidden="true">{favorites.length}</span>
          </NavLink>
          <button ref={toggle} className="icon-button menu-toggle" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className="mobile-navigation" aria-label="Navegación móvil" hidden={!open}>
        {links.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}
        <NavLink to="/favoritos" onClick={() => setOpen(false)}>Mis favoritos ({favorites.length})</NavLink>
      </nav>
    </header>
  )
}
