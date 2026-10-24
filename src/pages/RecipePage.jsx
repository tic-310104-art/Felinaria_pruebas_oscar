import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { recipes } from '../data/recipes'
import { validProgress } from '../utils/recipes'
import { usePersistentState } from '../hooks/usePersistentState'
import { useSavora } from '../hooks/useSavora'
import PageMeta from '../components/ui/PageMeta'
import RecipeHero from '../components/recipes/RecipeHero'
import RecipeActions from '../components/recipes/RecipeActions'
import IngredientsList from '../components/recipes/IngredientsList'
import PreparationSteps from '../components/recipes/PreparationSteps'
import RecipeGrid from '../components/recipes/RecipeGrid'
import NotFoundPage from './NotFoundPage'

function RecipeDetail({ recipe }) {
  const [progress, setProgress, storageError] = usePersistentState(
    `savora:progress:v1:${recipe.id}`,
    { ingredients: [], steps: [], multiplier: 1 },
    (value) => validProgress(value, recipe),
  )
  const { notify } = useSavora()
  function toggle(kind, id) {
    setProgress((current) => ({
      ...current,
      [kind]: current[kind].includes(id)
        ? current[kind].filter((item) => item !== id)
        : [...current[kind], id],
    }))
  }
  function reset() {
    setProgress((current) => ({ ...current, steps: [], ingredients: [] }))
    notify('Progreso reiniciado. Todo listo para cocinar de nuevo.')
  }
  function changePortions(multiplier) {
    setProgress((current) => ({ ...current, multiplier }))
  }

  return (
    <div className="container recipe-page">
      <PageMeta title={recipe.name} description={recipe.description} />
      <Link to="/recetas" className="back-link no-print"><ArrowLeft size={16} aria-hidden="true" />Volver al recetario</Link>
      <RecipeHero recipe={recipe} servings={recipe.servings * progress.multiplier} />
      <RecipeActions recipe={recipe} />
      <div className="recipe-workspace">
        <IngredientsList recipe={recipe} progress={progress} onToggle={(id) => toggle('ingredients', id)} onMultiplier={changePortions} />
        <PreparationSteps recipe={recipe} progress={progress} onToggle={(id) => toggle('steps', id)} onReset={reset} storageError={storageError} />
      </div>
      <section className="related-recipes section-space no-print" aria-labelledby="related-title">
        <div className="section-heading">
          <div><p className="eyebrow accent-text">SIGUE INSPIRÁNDOTE</p><h2 id="related-title">¿Y para la próxima?</h2></div>
          <Link className="text-link" to="/recetas">Todo el recetario <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <RecipeGrid recipes={recipes.filter((item) => item.id !== recipe.id)} />
      </section>
      <p className="print-only">Fierro 40k · El gusto de cocinar · /recetas/{recipe.id}</p>
    </div>
  )
}

export default function RecipePage() {
  const { slug } = useParams()
  const recipe = recipes.find((item) => item.id === slug)
  return recipe ? <RecipeDetail key={recipe.id} recipe={recipe} /> : <NotFoundPage />
}
