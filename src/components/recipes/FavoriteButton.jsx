import { Heart } from 'lucide-react'
import { useSavora } from '../../hooks/useSavora'

export default function FavoriteButton({ recipe, showLabel = false }) {
  const { favorites, toggleFavorite } = useSavora()
  const saved = favorites.includes(recipe.id)
  return <button className={`favorite-button ${showLabel ? 'with-label' : ''} ${saved ? 'is-saved' : ''}`} onClick={() => toggleFavorite(recipe)} aria-pressed={saved} aria-label={`${saved ? 'Quitar' : 'Guardar'} ${recipe.name} ${saved ? 'de' : 'en'} favoritos`}><Heart size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />{showLabel && <span>{saved ? 'Guardada' : 'Guardar receta'}</span>}</button>
}
