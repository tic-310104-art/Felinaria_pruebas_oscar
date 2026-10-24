import { ArrowUpRight, ChartNoAxesColumnIncreasing, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import RecipeImage from './RecipeImage'
import FavoriteButton from './FavoriteButton'

export default function RecipeCard({ recipe, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`
  return (
    <article className="recipe-card">
      <div className="card-photo-wrap"><RecipeImage recipe={recipe} /><span className={`category-label category-${recipe.id}`}>{recipe.category}</span><FavoriteButton recipe={recipe} /></div>
      <div className="card-body">
        <Heading className="card-title"><Link className="card-link" to={`/recetas/${recipe.id}`}>{recipe.name}<ArrowUpRight size={23} strokeWidth={1.4} aria-hidden="true" /></Link></Heading>
        <p>{recipe.shortDescription}</p>
        <div className="recipe-meta"><span><Clock3 size={16} aria-hidden="true" />{recipe.time} min{recipe.timeNote ? ' + enfriamiento' : ''}</span><span><ChartNoAxesColumnIncreasing size={16} aria-hidden="true" />{recipe.difficulty}</span></div>
      </div>
    </article>
  )
}
