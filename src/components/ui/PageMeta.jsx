import { useEffect } from 'react'

const SITE_TITLE = 'Fierro 40k'

export default function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = title === SITE_TITLE ? SITE_TITLE : `${title} | ${SITE_TITLE}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
  return null
}
