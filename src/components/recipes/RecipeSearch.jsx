import { Search, X } from 'lucide-react'

export default function RecipeSearch({ value, onChange }) {
  return <div className="search-field"><Search size={20} aria-hidden="true" /><label htmlFor="recipe-search" className="sr-only">Buscar por nombre o ingrediente</label><input id="recipe-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="¿Qué se te antoja? Busca una receta o ingrediente" autoComplete="off" />{value && <button className="icon-button" onClick={() => onChange('')} aria-label="Borrar búsqueda"><X size={18} /></button>}</div>
}
