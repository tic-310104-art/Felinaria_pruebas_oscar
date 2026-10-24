import { useContext } from 'react'
import { SavoraContext } from '../context/SavoraContext'

export function useSavora() {
  const context = useContext(SavoraContext)
  if (!context) throw new Error('useSavora requires SavoraProvider')
  return context
}
