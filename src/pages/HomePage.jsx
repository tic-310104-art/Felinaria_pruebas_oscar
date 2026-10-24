import { ArrowRight, ArrowUpRight, ChefHat, Clock3, HeartHandshake, Leaf, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recipes } from '../data/recipes'
import PageMeta from '../components/ui/PageMeta'
import RecipeImage from '../components/recipes/RecipeImage'
import RecipeGrid from '../components/recipes/RecipeGrid'

export default function HomePage() {
  return (
    <>
      <PageMeta title="Fierro 40k" description="Cocinar también es crear momentos. Descubre nuestras recetas de pan francés, pollo a la naranja y mochis dulces, paso a paso y a tu ritmo." />
      <section className="home-hero container" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="small-rule" />EL GUSTO DE LO HECHO EN CASA</p>
          <h1 id="home-title">Cocinar también<br className="desktop-break" /> es crear <em>momentos.</em></h1>
          <p className="hero-description">Hay días que empiezan con un antojo y terminan con un gran recuerdo. Encuentra tu próxima receta y disfruta el proceso.</p>
          <Link className="button button-primary" to="/recetas">Explorar recetas <ArrowRight size={18} aria-hidden="true" /></Link>
          <div className="hero-footnote">
            <Sprout size={20} strokeWidth={1.3} aria-hidden="true" />
            <span>Un poco de inspiración. Mucho sabor.</span>
          </div>
        </div>
        <div className="hero-visual">
          <RecipeImage recipe={recipes[0]} priority sizes="(min-width: 900px) 50vw, 100vw" />
          <div className="homemade-seal" aria-hidden="true">
            <span>EL PLACER DE</span><Sprout size={32} strokeWidth={1.2} /><span>COCINAR EN CASA</span>
          </div>
          <Link to="/recetas/pan-frances" className="hero-recipe-link">
            <span>
              <span className="eyebrow">PARA EMPEZAR EL DÍA</span>
              <strong>Pan francés</strong>
              <span className="hero-recipe-time"><Clock3 size={14} aria-hidden="true" />20 min · Fácil</span>
            </span>
            <span className="round-arrow"><ArrowUpRight size={23} aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
      <div className="values-strip">
        <div className="container">
          <span><Leaf size={20} strokeWidth={1.5} aria-hidden="true" />Ingredientes cotidianos</span>
          <span><ChefHat size={21} strokeWidth={1.5} aria-hidden="true" />Paso a paso, a tu ritmo</span>
          <span><HeartHandshake size={21} strokeWidth={1.5} aria-hidden="true" />Hecho para compartir</span>
        </div>
      </div>
      <section className="container section-space" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent-text">UN ANTOJO PARA CADA MOMENTO</p>
            <h2 id="featured-title">Hoy se cocina algo especial.</h2>
          </div>
          <Link className="text-link" to="/recetas">Ver todas las recetas <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <RecipeGrid recipes={recipes} />
      </section>
      <section className="container philosophy-wrap" aria-labelledby="philosophy-title">
        <div className="philosophy-panel">
          <div className="philosophy-symbol" aria-hidden="true"><Sprout strokeWidth={0.7} /><span>SABOREA LO SIMPLE</span></div>
          <div className="philosophy-copy">
            <p className="eyebrow">LA ESENCIA DE FIERRO 40K</p>
            <h2 id="philosophy-title">La buena cocina empieza<br />con las ganas de <em>disfrutar.</em></h2>
            <p>No necesitas una ocasión especial ni una cocina perfecta. Solo buenos ingredientes, un poco de curiosidad y el gusto de hacer algo para ti y para los tuyos.</p>
          </div>
        </div>
      </section>
    </>
  )
}
