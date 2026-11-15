// Video demo de 30 s: grabación real de la app (Crew en un "teléfono" + Ground), subtítulos en inglés.
// Uso: node record.mjs [baseUrl]  → entrega/video/nutriverso-demo-30s.mp4
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, renameSync } from 'node:fs'
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:5180'
const OUT = decodeURIComponent(new URL('../video/', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
mkdirSync(OUT, { recursive: true })

const STAGE = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;background:#05070f;color:#e6ebf5;font-family:Inter,system-ui,Segoe UI,sans-serif;overflow:hidden}
#cap{position:absolute;top:28px;left:0;right:0;text-align:center;font-size:44px;font-weight:700;letter-spacing:.2px;transition:opacity .35s}
#sub{position:absolute;top:92px;left:0;right:0;text-align:center;font-size:26px;color:#a3aec7}
#phone{position:absolute;left:110px;top:150px;width:390px;height:844px;border:14px solid #1b2440;border-radius:46px;overflow:hidden;transform:scale(1.02);transform-origin:top left;box-shadow:0 0 0 2px #2a3558,0 30px 80px #0008}
#phone iframe{width:390px;height:844px;border:0}
#ground{position:absolute;left:600px;top:150px;width:1440px;height:900px;transform:scale(.86);transform-origin:top left;border:2px solid #2a3558;border-radius:18px;overflow:hidden}
#ground iframe{width:1440px;height:900px;border:0}
.lbl{position:absolute;top:1052px;font-size:20px;color:#a3aec7}
#foot{position:absolute;bottom:14px;right:28px;font-size:18px;color:#a3aec7}
</style></head><body>
<div id="cap">NutriVerso Crew Health</div><div id="sub">Self-care at Mars distance · NASA Space Apps 2026</div>
<div id="phone"><iframe id="crew" src="${BASE}/#/crew"></iframe></div>
<div id="ground"><iframe id="gnd" src="${BASE}/#/ground"></iframe></div>
<div id="foot">Real app · simulated crew data · it guides, it does not diagnose</div>
</body></html>`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } })
await ctx.addInitScript(() => {
  try { localStorage.setItem('nv.lang', 'en') } catch {}
})
const page = await ctx.newPage()
await page.route(`${BASE}/__stage`, (r) => r.fulfill({ contentType: 'text/html', body: STAGE }))
const t0 = Date.now()
await page.goto(`${BASE}/__stage`)
const crew = page.frameLocator('#crew')
const gnd = page.frameLocator('#gnd')
await crew.locator('.legend__item').first().waitFor()
await gnd.locator('.crewlist__item').first().waitFor()
await crew.locator('.sw__meta').waitFor({ timeout: 20000 }).catch(() => {})

const cap = async (title, sub = '') =>
  page.evaluate(([t, s]) => {
    document.getElementById('cap').textContent = t
    document.getElementById('sub').textContent = s
  }, [title, sub])
const at = async (sec) => {
  const wait = t0 + sec * 1000 - Date.now()
  if (wait > 0) await page.waitForTimeout(wait)
}

await at(3.5)
await cap('Miguel’s body map: Bone and Muscle in alert', 'Nutrition lives inside the status lights')
await at(7)
await crew.locator('.legend__item', { hasText: 'Bone' }).click()
await crew.locator('.detail').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'smooth' }))
await cap('Water vs. his personal NASA target → “Self-care now”', 'Every threshold shows its source and evidence level')
await at(12)
await cap('He sends the weekly report to the flight surgeon', 'It travels with the Earth–Mars delay (accelerated: 1 min = 1 s)')
await crew.locator('.tabbar__btn', { hasText: 'Messages' }).click()
await page.waitForTimeout(500)
await crew.getByRole('button', { name: /Send weekly report/ }).click()
await at(15)
await cap('Ground sees it in transit…', 'Mission control ranks the crew by severity · live NASA space weather')
await gnd.locator('.alerts').waitFor({ timeout: 20000 })
await cap('…and receives it 12 s later', 'Weekly averages vs NASA targets · days in alert')
const tArrive = (Date.now() - t0) / 1000
await gnd.locator('.bubble--crew').last().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'smooth' }))
await at(Math.max(tArrive + 3.5, 27))
await cap('NutriVerso Crew Health', 'sebastianmella1625-dev.github.io/nutriverso · Team NutriVerso, Concepción')
await at(Math.max(tArrive + 6.5, 30.5))
const tEnd = (Date.now() - t0) / 1000
await ctx.close()
await browser.close()

const webm = readdirSync(OUT).filter((f) => f.endsWith('.webm')).map((f) => OUT + f).pop()
const raw = OUT + 'raw.webm'
renameSync(webm, raw)
// Recorta los últimos 30 s (descarta la carga inicial) y convierte a MP4 H.264
const start = Math.max(0, tEnd - 30).toFixed(2)
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', start, '-i', raw, '-t', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', '30', OUT + 'nutriverso-demo-30s.mp4'])
console.log(`OK video (t llegada informe=${tArrive.toFixed(1)} s, fin=${tEnd.toFixed(1)} s, recorte desde ${start} s) →`, OUT + 'nutriverso-demo-30s.mp4')
