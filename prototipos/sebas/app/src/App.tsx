import { useEffect, useState } from 'react'

export type Route = 'crew' | 'ground'

/** Lee la ruta desde el hash (#/crew, #/ground). Por defecto: crew. */
export function routeFromHash(hash: string): Route {
  return hash.replace(/^#\/?/, '') === 'ground' ? 'ground' : 'crew'
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

// Placeholder de la Task 1: las vistas reales llegan en Task 7 (Crew) y Task 8 (Ground),
// y los textos pasan a i18n en Task 5.
export default function App() {
  const route = useRoute()
  return (
    <main style={{ padding: 'var(--space-4)' }}>
      <nav style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <a href="#/crew" aria-current={route === 'crew' ? 'page' : undefined}>Crew</a>
        <a href="#/ground" aria-current={route === 'ground' ? 'page' : undefined}>Ground</a>
      </nav>
      <h1>NutriVerso · {route === 'crew' ? 'Crew' : 'Ground'}</h1>
    </main>
  )
}
