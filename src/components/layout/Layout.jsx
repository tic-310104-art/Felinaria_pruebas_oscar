import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PwaControls from '../pwa/PwaControls'

export default function Layout() {
  const { pathname, hash } = useLocation()
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      target?.scrollIntoView()
      target?.focus({ preventScroll: true })
    } else if (lastPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
    lastPath.current = pathname
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
      <Header key={pathname} />
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <Footer />
      <PwaControls />
    </>
  )
}
