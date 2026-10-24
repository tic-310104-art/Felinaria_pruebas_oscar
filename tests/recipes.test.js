import test from 'node:test'
import assert from 'node:assert/strict'
import { recipes, portionMultipliers } from '../src/data/recipes.js'
import { filterRecipes, formatIngredient, formatQuantity, stepText, validProgress } from '../src/utils/recipes.js'

test('the collection contains exactly the three complete requested recipes', () => {
  assert.deepEqual(recipes.map((recipe) => recipe.name), ['Pan francés', 'Pollo a la naranja', 'Mochis dulces'])
  assert.deepEqual(recipes.map((recipe) => recipe.ingredients.length), [8, 12, 6])
  assert.deepEqual(recipes.map((recipe) => recipe.steps.length), [5, 7, 8])
  assert.deepEqual(recipes.map((recipe) => recipe.servings), [2, 4, 8])
  assert.deepEqual(recipes.map((recipe) => recipe.time), [20, 40, 35])
  for (const recipe of recipes) {
    assert.equal(new Set(recipe.ingredients.map((item) => item.id)).size, recipe.ingredients.length)
    assert.equal(new Set(recipe.steps.map((step) => step.id)).size, recipe.steps.length)
    assert.ok(recipe.steps.every((step) => step.title && step.text))
  }
})

test('search ignores case, accents and whitespace and searches ingredient units', () => {
  assert.deepEqual(filterRecipes(recipes, '  PAN FRANCES ', 'Todas').map((recipe) => recipe.id), ['pan-frances'])
  assert.equal(filterRecipes(recipes, 'FECULA', 'Todas').length, 2)
  assert.equal(filterRecipes(recipes, 'huevos', 'Todas')[0].id, 'pan-frances')
  assert.equal(filterRecipes(recipes, 'harina arroz', 'Todas')[0].id, 'mochis-dulces')
})

test('search and category filters are combined, including empty results', () => {
  assert.equal(filterRecipes(recipes, '', 'Todas').length, 3)
  assert.equal(filterRecipes(recipes, 'naranja', 'Comida').length, 1)
  assert.equal(filterRecipes(recipes, 'naranja', 'Desayuno').length, 0)
  assert.equal(filterRecipes(recipes, 'ingrediente inexistente', 'Todas').length, 0)
})

test('quantities use readable fractions and appropriate units', () => {
  assert.equal(formatQuantity(0.25), '¼')
  assert.equal(formatQuantity(1.5), '1 ½')
  assert.equal(formatQuantity(2.75), '2 ¾')
  assert.equal(formatIngredient(recipes[0].ingredients[3], 0.5), '½ cucharadita de extracto de vainilla')
  assert.equal(formatIngredient(recipes[0].ingredients[3], 2), '2 cucharaditas de extracto de vainilla')
  assert.equal(formatIngredient(recipes[0].ingredients[6], 3), 'Miel de maple al gusto')
})

test('both cornstarch and dissolving water scale together', () => {
  const starch = recipes[1].ingredients.find((item) => item.id === 'espesante')
  assert.equal(formatIngredient(starch, 0.5), '½ cucharadita de fécula de maíz adicional disuelta en 1 cucharada de agua')
  assert.equal(formatIngredient(starch, 2), '2 cucharaditas de fécula de maíz adicional disuelta en 4 cucharadas de agua')
})

test('mochi portion references follow the selected yield', () => {
  for (const multiplier of portionMultipliers) {
    const servings = recipes[2].servings * multiplier
    assert.ok(Number.isInteger(servings))
    assert.match(stepText(recipes[2].steps[0], servings), new RegExp(`en ${servings} porciones`))
    assert.match(stepText(recipes[2].steps[5], servings), new RegExp(`en ${servings} porciones`))
  }
})

test('progress validation rejects malformed, stale and duplicated data', () => {
  const recipe = recipes[0]
  const good = { ingredients: ['pan'], steps: ['mezcla'], multiplier: 1 }
  assert.equal(validProgress(good, recipe), true)
  for (const bad of [null, [], {}, { ...good, multiplier: 99 }, { ...good, ingredients: ['missing'] }, { ...good, steps: ['mezcla', 'mezcla'] }, { ...good, steps: 'mezcla' }]) {
    assert.equal(validProgress(bad, recipe), false)
  }
})
