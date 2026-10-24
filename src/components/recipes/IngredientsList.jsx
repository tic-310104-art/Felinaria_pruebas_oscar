import { Minus, Plus } from 'lucide-react'
import { portionMultipliers } from '../../data/recipes'
import { formatIngredient } from '../../utils/recipes'

export default function IngredientsList({ recipe, progress, onToggle, onMultiplier }) {
  const index = portionMultipliers.indexOf(progress.multiplier)
  return (
    <section className="ingredients-panel" aria-labelledby="ingredients-title">
      <div className="ingredients-heading"><h2 id="ingredients-title">Ingredientes</h2><p>Lo que vas a necesitar</p></div>
      <div className="portion-control">
        <span id="portions-label">{recipe.servings * progress.multiplier} {recipe.servingUnit}</span>
        <div className="no-print">
          <button className="icon-button" aria-label="Reducir porciones" aria-describedby="portions-label" disabled={index === 0} onClick={() => onMultiplier(portionMultipliers[index - 1])}><Minus size={16} /></button>
          <button className="icon-button" aria-label="Aumentar porciones" aria-describedby="portions-label" disabled={index === portionMultipliers.length - 1} onClick={() => onMultiplier(portionMultipliers[index + 1])}><Plus size={16} /></button>
        </div>
      </div>
      <p className="portion-help no-print" role="status">Cantidades para {recipe.servings * progress.multiplier} {recipe.servingUnit}. Marca lo que ya tienes.</p>
      <ul className="ingredients-list">
        {recipe.ingredients.map((item) => (
          <li key={item.id}>
            <label className={progress.ingredients.includes(item.id) ? 'checked' : ''}>
              <input type="checkbox" checked={progress.ingredients.includes(item.id)} onChange={() => onToggle(item.id)} />
              <span>{formatIngredient(item, progress.multiplier)}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="ingredient-count no-print">{progress.ingredients.length} de {recipe.ingredients.length} ingredientes listos</p>
    </section>
  )
}
