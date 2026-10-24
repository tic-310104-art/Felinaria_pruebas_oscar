import { useSearchParams } from 'react-router-dom'
import { recipes, categories } from '../data/recipes'
import { filterRecipes } from '../utils/recipes'
import RecipeGrid from '../components/recipes/RecipeGrid'
import RecipeSearch from '../components/recipes/RecipeSearch'
import CategoryFilter from '../components/recipes/CategoryFilter'
import EmptyState from '../components/ui/EmptyState'
import PageMeta from '../components/ui/PageMeta'

export default function RecipesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const category = categories.includes(params.get('categoria')) ? params.get('categoria') : 'Todas'
  const filtered = filterRecipes(recipes, query, category)
  const active = query !== '' || category !== 'Todas'
  function update(name, value) {
    const next = new URLSearchParams(params)
    if (!value || value === 'Todas') next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  return (
    <div className="container page-space">
      <PageMeta title="Recetas" description="Encuentra tu próximo antojo. Busca por ingrediente y explora nuestras tres recetas de desayuno, comida y postres." />
      <header className="page-heading">
        <p className="eyebrow accent-text">NUESTRO RECETARIO</p>
        <h1>¿Qué cocinamos <em>hoy?</em></h1>
        <p>De una mañana tranquila a un final dulce.<br />Tres recetas, muchas ganas de cocinar.</p>
      </header>
      <div className="catalog-tools">
        <RecipeSearch value={query} onChange={(value) => update('q', value)} />
        <CategoryFilter value={category} onChange={(value) => update('categoria', value)} />
      </div>
      <div className="results-bar">
        <p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'receta para inspirarte' : 'recetas para inspirarte'}</p>
        {active && <button className="text-button" onClick={() => setParams({})}>Limpiar filtros</button>}
      </div>
      {filtered.length ? <RecipeGrid recipes={filtered} headingLevel={2} /> : (
        <EmptyState title="Ese antojo aún no está aquí" description="Prueba con «naranja», «leche» o «arroz», o vuelve a ver todas las recetas.">
          <button className="button button-primary" onClick={() => setParams({})}>Ver todas las recetas</button>
        </EmptyState>
      )}
      <div className="catalog-note">
        <span aria-hidden="true">✳</span>
        <p>Una buena receta es solo el comienzo.<br /><strong>El toque especial lo pones tú.</strong></p>
      </div>
    </div>
  )
}
