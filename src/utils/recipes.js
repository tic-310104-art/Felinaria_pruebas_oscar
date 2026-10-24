export function normalizeText(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
}

export function filterRecipes(recipes, query, category) {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  return recipes.filter((recipe) => {
    const text = normalizeText([recipe.name, ...recipe.ingredients.map((item) => `${item.name} ${item.unit?.join(' ') || ''}`)].join(' '))
    return (category === 'Todas' || category === recipe.category) && words.every((word) => text.includes(word))
  })
}

export function formatQuantity(value) {
  const whole = Math.floor(value)
  const fraction = value - whole
  const fractions = { 0.25: '¼', 0.5: '½', 0.75: '¾' }
  if (fractions[fraction]) return `${whole || ''}${whole ? ' ' : ''}${fractions[fraction]}`
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value)
}

export function formatIngredient(item, multiplier = 1) {
  if (item.amount == null) return item.name
  const amount = item.amount * multiplier
  const unit = item.unit[amount <= 1 ? 0 : 1]
  const text = [item.prefix, formatQuantity(amount), unit, item.name].filter(Boolean).join(' ')
  if (!item.water) return text
  const water = item.water * multiplier
  return `${text} disuelta en ${formatQuantity(water)} ${water <= 1 ? 'cucharada' : 'cucharadas'} de agua`
}

export function stepText(step, servings) {
  return step.text.replaceAll('{porciones}', String(servings))
}

export function validProgress(value, recipe) {
  return value != null && typeof value === 'object'
    && [0.5, 1, 2, 3].includes(value.multiplier)
    && ['ingredients', 'steps'].every((kind) => Array.isArray(value[kind])
      && new Set(value[kind]).size === value[kind].length
      && value[kind].every((id) => recipe[kind].some((item) => item.id === id)))
}
