import { ChartNoAxesColumnIncreasing, Clock3, Users } from 'lucide-react'
import RecipeImage from './RecipeImage'

export default function RecipeHero({ recipe, servings }) {
  return (
    <header className="detail-hero">
      <div className="detail-hero-copy">
        <span className="eyebrow accent-text">{recipe.category} · HECHO EN CASA</span>
        <h1>{recipe.name}</h1>
        <p className="detail-tagline">{recipe.tagline}</p>
        <p>{recipe.description}</p>
        <dl className="detail-facts">
          <div>
            <dt><Clock3 size={18} aria-hidden="true" />Tiempo</dt>
            <dd>{recipe.time} min{recipe.timeNote && <small>+ {recipe.timeNote}</small>}</dd>
          </div>
          <div><dt><ChartNoAxesColumnIncreasing size={18} aria-hidden="true" />Dificultad</dt><dd>{recipe.difficulty}</dd></div>
          <div>
            <dt><Users size={18} aria-hidden="true" />{recipe.servingUnit === 'piezas' ? 'Rendimiento' : 'Porciones'}</dt>
            <dd>{servings}{recipe.servingUnit === 'piezas' && ' piezas'}</dd>
          </div>
        </dl>
        <a href="#preparacion" className="button button-primary no-print">Vamos a cocinar <span aria-hidden="true">↓</span></a>
      </div>
      <div className="detail-hero-image"><RecipeImage recipe={recipe} priority sizes="(min-width: 900px) 50vw, 100vw" /></div>
    </header>
  )
}
