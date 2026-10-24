import { categories } from '../../data/recipes'

export default function CategoryFilter({ value, onChange }) {
  return <fieldset className="category-filter"><legend className="sr-only">Filtrar por categoría</legend>{categories.map((category) => <button key={category} type="button" aria-pressed={value === category} className={`filter-chip ${value === category ? 'selected' : ''}`} onClick={() => onChange(category)}>{category === 'Todas' ? 'Todas las recetas' : category}</button>)}</fieldset>
}
