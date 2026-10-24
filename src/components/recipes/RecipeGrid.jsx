import RecipeCard from './RecipeCard'

export default function RecipeGrid({ recipes, headingLevel = 3 }) {
  return <div className="recipe-grid">{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} headingLevel={headingLevel} />)}</div>
}
