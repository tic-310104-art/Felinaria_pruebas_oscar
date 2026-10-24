import { useState } from 'react'
import { CookingPot } from 'lucide-react'
import { photos } from '../../data/photos'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

function Photo({ recipe, online, priority = false, sizes = '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw', className = '' }) {
  const [failed, setFailed] = useState(false)
  const photo = photos[recipe.id]
  if (failed) return (
    <div className={`photo-fallback ${className}`} role="group" aria-label={`Fotografía de ${recipe.name}`}>
      <CookingPot size={48} aria-hidden="true" /><span>{recipe.name}</span>
      <span className="photo-unavailable">{online ? 'No se pudo cargar la fotografía.' : 'Fotografía no disponible sin conexión.'}</span>
      {online && <button className="text-button" onClick={() => setFailed(false)}>Reintentar fotografía</button>}
    </div>
  )
  return <img className={`recipe-photo photo-${recipe.id} ${className}`} src={photo.large} srcSet={`${photo.small} 640w, ${photo.medium} 800w, ${photo.large} ${photo.width}w`} sizes={sizes} alt={recipe.imageAlt} width={photo.width} height={photo.height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />
}

export default function RecipeImage(props) {
  const online = useOnlineStatus()
  // A restored connection retries failed images without resetting page state.
  return <Photo key={`${props.recipe.id}:${online}`} {...props} online={online} />
}
