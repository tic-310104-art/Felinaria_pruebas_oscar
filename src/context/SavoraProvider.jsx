import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { SavoraContext } from './SavoraContext'
import { usePersistentState } from '../hooks/usePersistentState'
import { recipes } from '../data/recipes'

const validFavorites = (value) => Array.isArray(value)
  && new Set(value).size === value.length
  && value.every((id) => recipes.some((recipe) => recipe.id === id))

export default function SavoraProvider({ children }) {
  const [favorites, setFavorites, storageError] = usePersistentState('savora:favorites:v1', [], validFavorites)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const notify = (text) => setMessage({ text })
  function toggleFavorite(recipe) {
    const saved = favorites.includes(recipe.id)
    const persisted = setFavorites((current) => saved ? current.filter((id) => id !== recipe.id) : [...current, recipe.id])
    notify(persisted
      ? `${recipe.name}: ${saved ? 'eliminada de tus favoritos' : 'guardada en tus favoritos'}.`
      : 'El navegador no permite guardar. Tus favoritos estarán disponibles durante esta sesión.')
  }

  return (
    <SavoraContext.Provider value={{ favorites, toggleFavorite, notify, storageError }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {message && <div className="toast"><Check size={20} aria-hidden="true" /><span>{message.text}</span><button className="icon-button" onClick={() => setMessage(null)} aria-label="Cerrar mensaje"><X size={18} /></button></div>}
      </div>
    </SavoraContext.Provider>
  )
}
