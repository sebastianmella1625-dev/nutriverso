export type Route = 'crew' | 'ground'

/** Lee la ruta desde el hash (#/crew, #/ground). Por defecto: crew. */
export function routeFromHash(hash: string): Route {
  return hash.replace(/^#\/?/, '') === 'ground' ? 'ground' : 'crew'
}
