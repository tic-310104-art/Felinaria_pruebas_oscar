import { Printer } from 'lucide-react'
import FavoriteButton from './FavoriteButton'

export default function RecipeActions({ recipe }) {
  return (
    <div className="recipe-actions-wrap no-print">
      <div className="recipe-actions">
        <FavoriteButton recipe={recipe} showLabel />
        <button className="button button-outline" onClick={() => window.print()}>
          <Printer size={17} aria-hidden="true" />Imprimir
        </button>
      </div>
    </div>
  )
}
