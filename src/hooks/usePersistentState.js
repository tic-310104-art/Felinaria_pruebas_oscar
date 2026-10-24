import { useCallback, useRef, useState } from 'react'

function readValue(key, fallback, validate) {
  let raw
  try {
    raw = localStorage.getItem(key)
  } catch {
    return { value: fallback, error: true }
  }
  if (raw === null) return { value: fallback, error: false }
  try {
    const value = JSON.parse(raw)
    return { value: validate(value) ? value : fallback, error: false }
  } catch {
    // Invalid JSON is recoverable; it does not mean storage is unavailable.
    return { value: fallback, error: false }
  }
}

// All writes happen in event handlers; a blocked store still permits in-memory use.
export function usePersistentState(key, fallback, validate) {
  const [state, setState] = useState(() => readValue(key, fallback, validate))
  const current = useRef(state.value)
  const update = useCallback((valueOrUpdater) => {
    const value = typeof valueOrUpdater === 'function' ? valueOrUpdater(current.current) : valueOrUpdater
    let error = false
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { error = true }
    current.current = value
    setState({ value, error })
    return !error
  }, [key])
  return [state.value, update, state.error]
}
