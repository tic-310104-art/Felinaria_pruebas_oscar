export default function ProgressIndicator({ completed, total }) {
  const percentage = Math.round(completed / total * 100)
  return <div className="progress-indicator no-print"><div><span>Tu progreso</span><strong>{percentage}%</strong></div><progress value={completed} max={total} aria-label="Progreso de preparación">{percentage}%</progress><p role="status" aria-live="polite">{completed === total ? '¡A la mesa! Has completado todos los pasos.' : `${completed} de ${total} pasos completados. A tu ritmo.`}</p></div>
}
