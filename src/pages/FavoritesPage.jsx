import { ArrowRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSavora } from '../hooks/useSavora'
import { recipes } from '../data/recipes'
import RecipeGrid from '../components/recipes/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'
import PageMeta from '../components/ui/PageMeta'

export default function FavoritesPage() {
  const { favorites, storageError } = useSavora()
  const saved = recipes.filter((recipe) => favorites.includes(recipe.id))
  return (
    <div className="container page-space favorites-page">
      <PageMeta title="Mis favoritos" description="Tu colección personal de recetas Fierro 40k. Guarda tus favoritas y vuelve a ellas cuando tengas ganas de cocinar." />
      <header className="page-heading">
        <p className="eyebrow accent-text"><Heart size={16} aria-hidden="true" /> TU COLECCIÓN PERSONAL</p>
        <h1>Para volver a <em>cocinar.</em></h1>
        <p>Esas recetas que quieres tener siempre a mano.</p>
      </header>
      {storageError && (
        <p className="inline-notice" role="status">El almacenamiento de tu navegador no está disponible. Tus favoritos se conservarán solo durante esta sesión.</p>
      )}
      {saved.length ? (
        <>
          <p className="results-bar" role="status">{saved.length} {saved.length === 1 ? 'receta guardada' : 'recetas guardadas'}</p>
          <RecipeGrid recipes={saved} headingLevel={2} />
        </>
      ) : (
        <EmptyState title="Tu recetario empieza con un antojo" description="Toca el corazón de una receta para guardarla aquí. No necesitas una cuenta.">
          <Link className="button button-primary" to="/recetas">Encontrar mi próxima receta <ArrowRight size={18} aria-hidden="true" /></Link>
        </EmptyState>
      )}
      <p className="privacy-note">Tus favoritos se guardan únicamente en este navegador.</p>
    </div>
  )
}
