// Capturas reales de NutriVerso para slides y página Project (modo local, inglés, misión recién sembrada).
// Uso: node capture.mjs [baseUrl]   (por defecto el servidor de desarrollo http://localhost:5180)
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:5180'
const OUT = new URL('../capturas/', import.meta.url)
mkdirSync(OUT, { recursive: true })
const path = (f) => decodeURIComponent(new URL(f, OUT).pathname).replace(/^\/([A-Za-z]:)/, '$1')

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ deviceScaleFactor: 2, locale: 'en-US' })
await ctx.addInitScript(() => localStorage.setItem('nv.lang', 'en'))

const crew = await ctx.newPage()
await crew.setViewportSize({ width: 390, height: 844 })
await crew.goto(`${BASE}/#/crew`)
await crew.waitForSelector('.legend__item')
await crew.waitForSelector('.sw__meta', { timeout: 20000 })
await crew.waitForTimeout(800)
await crew.screenshot({ path: path('01-crew-body.png') })

await crew.locator('.legend__item', { hasText: 'Bone' }).click()
await crew.locator('.detail').scrollIntoViewIfNeeded()
await crew.evaluate(() => document.querySelector('.detail')?.scrollIntoView({ block: 'start' }))
await crew.waitForTimeout(500)
await crew.screenshot({ path: path('02-crew-bone.png') })

await crew.locator('.tabbar__btn', { hasText: 'Check-in' }).click()
await crew.waitForTimeout(400)
await crew.screenshot({ path: path('03-crew-checkin.png') })

const ground = await ctx.newPage()
await ground.setViewportSize({ width: 1440, height: 900 })
await ground.goto(`${BASE}/#/ground`)
await ground.waitForSelector('.crewlist__item')

await crew.bringToFront()
await crew.locator('.tabbar__btn', { hasText: 'Messages' }).click()
await crew.getByRole('button', { name: /Send weekly report/ }).click()
await crew.waitForSelector('.report-box__sent')
await crew.screenshot({ path: path('04-crew-report-sent.png') })

await ground.bringToFront()
await ground.waitForSelector('.alerts', { timeout: 30000 })
await ground.waitForTimeout(800)
await ground.screenshot({ path: path('05-ground-console.png') })
await ground.screenshot({ path: path('06-ground-full.png'), fullPage: true })

await browser.close()
console.log('OK capturas en', path(''))
