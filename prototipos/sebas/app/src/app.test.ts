import { describe, expect, it } from 'vitest'
import { routeFromHash } from './App'

describe('scaffold', () => {
  it('runs vitest', () => {
    expect(1).toBe(1)
  })

  it('routes hash to view, crew by default', () => {
    expect(routeFromHash('#/ground')).toBe('ground')
    expect(routeFromHash('#/crew')).toBe('crew')
    expect(routeFromHash('')).toBe('crew')
    expect(routeFromHash('#/anything')).toBe('crew')
  })
})
