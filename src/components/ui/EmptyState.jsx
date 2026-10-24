import { SearchX } from 'lucide-react'

export default function EmptyState({ title, description, children }) {
  return <div className="empty-state"><SearchX size={34} strokeWidth={1.4} aria-hidden="true" /><h2>{title}</h2><p>{description}</p>{children}</div>
}
