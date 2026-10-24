import { ChefHat, RotateCcw } from 'lucide-react'
import { stepText } from '../../utils/recipes'
import ProgressIndicator from './ProgressIndicator'

export default function PreparationSteps({ recipe, progress, onToggle, onReset, storageError }) {
  return (
    <section className="preparation-panel" id="preparacion" tabIndex={-1} aria-labelledby="preparation-title">
      <div className="preparation-heading">
        <div><p className="eyebrow accent-text">MANOS A LA OBRA</p><h2 id="preparation-title">Paso a paso</h2></div>
        <ChefHat size={32} strokeWidth={1.2} aria-hidden="true" />
      </div>
      <ProgressIndicator completed={progress.steps.length} total={recipe.steps.length} />
      <ol className="steps-list">
        {recipe.steps.map((step, index) => (
          <li key={step.id} className={progress.steps.includes(step.id) ? 'step-complete' : ''}>
            <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{stepText(step, recipe.servings * progress.multiplier)}</p>
              <label className="step-checkbox no-print">
                <input type="checkbox" checked={progress.steps.includes(step.id)} onChange={() => onToggle(step.id)} />
                <span>
                  {progress.steps.includes(step.id) ? 'Paso completado' : 'Marcar como completado'}
                  <span className="sr-only">: paso {index + 1}</span>
                </span>
              </label>
            </div>
          </li>
        ))}
      </ol>
      <div className="progress-footer no-print">
        <p>{storageError ? 'No se pudo guardar en el navegador. El progreso sigue disponible en esta página.' : 'Tu progreso se guarda automáticamente en este navegador.'}</p>
        <button className="text-button" onClick={onReset} disabled={!progress.steps.length && !progress.ingredients.length}>
          <RotateCcw size={15} aria-hidden="true" />Reiniciar progreso
        </button>
      </div>
      <aside className="cooking-tip">
        <ChefHat size={23} strokeWidth={1.5} aria-hidden="true" />
        <div><h3>Un pequeño consejo</h3><p>{recipe.tip}</p></div>
      </aside>
    </section>
  )
}
