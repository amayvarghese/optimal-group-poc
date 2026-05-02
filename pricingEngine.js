import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_CSV = path.join(__dirname, 'data', 'uk_property_maintenance_prices.csv')

/** @typedef {{ category: string, service: string, priceRangeRaw: string, min: number, max: number, mid: number }} CatalogRow */

/**
 * Minimal CSV parser (handles quoted fields with commas).
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQ = !inQ
      continue
    }
    if (c === ',' && !inQ) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur)
  return out
}

/**
 * Parse UK-style price strings: £150–£325, £1,200–£2,000, en-dash or hyphen.
 * @param {string} raw
 * @returns {{ min: number, max: number, mid: number }}
 */
export function parsePriceRange(raw) {
  const s = String(raw)
    .replace(/\u2013/g, '-')
    .replace(/–/g, '-')
    .replace(/£/g, '')
    .replace(/,/g, '')
  const nums = s.match(/\d+(?:\.\d+)?/g)
  if (!nums || nums.length === 0) return { min: 0, max: 0, mid: 0 }
  const n = nums.map(Number)
  if (n.length === 1) return { min: n[0], max: n[0], mid: n[0] }
  const min = Math.min(n[0], n[1])
  const max = Math.max(n[0], n[1])
  return { min, max, mid: (min + max) / 2 }
}

/**
 * @param {string} s
 */
function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * @param {string} filePath
 * @returns {CatalogRow[]}
 */
export function loadPricingCatalog(filePath = DEFAULT_CSV) {
  const text = readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i])
    if (parts.length < 3) continue
    const category = parts[0].trim()
    const service = parts[1].trim()
    const priceRangeRaw = parts.slice(2).join(',').trim()
    const { min, max, mid } = parsePriceRange(priceRangeRaw)
    rows.push({ category, service, priceRangeRaw, min, max, mid })
  }
  return rows
}

let cachedCatalog = null
let cachedPath = null

/**
 * @param {string} [filePath]
 * @returns {CatalogRow[]}
 */
export function getPricingCatalog(filePath = DEFAULT_CSV) {
  if (cachedCatalog && cachedPath === filePath) return cachedCatalog
  cachedCatalog = loadPricingCatalog(filePath)
  cachedPath = filePath
  return cachedCatalog
}

/**
 * @param {string} descriptionNorm
 * @param {CatalogRow} row
 */
function scoreRow(descriptionNorm, row) {
  const hay = ` ${descriptionNorm} `
  const rowBlob = normalizeText(`${row.category} ${row.service}`)
  const words = rowBlob.split(' ').filter((w) => w.length >= 3)
  let score = 0
  for (const w of words) {
    if (hay.includes(w)) score += 2
  }
  const phrase = normalizeText(row.service)
  if (phrase.length > 4 && hay.includes(phrase)) score += 18
  const catWords = normalizeText(row.category)
    .split(' ')
    .filter((w) => w.length >= 3)
  for (const w of catWords) {
    if (hay.includes(w)) score += 4
  }
  // Light stem: "painting" matches "painter"
  if (hay.includes('paint') && normalizeText(row.service).includes('paint')) score += 3
  if (hay.includes('plaster') && normalizeText(row.category).includes('plaster')) score += 3
  if (hay.includes('render') && normalizeText(row.category).includes('render')) score += 3
  if (hay.includes('wallpaper') && normalizeText(row.category).includes('wallpaper')) score += 3
  if (hay.includes('floor') && normalizeText(row.category).includes('floor')) score += 3
  return score
}

/**
 * Score catalog rows against free text. **Totals use the single best row** (overlapping interior
 * lines must not be summed). `matches` lists the best row first, then up to four runners-up for UI.
 * @param {string} description
 * @param {CatalogRow[]} [catalog]
 * @returns {{
 *   totalMin: number,
 *   totalMax: number,
 *   totalMid: number,
 *   currency: string,
 *   matches: Array<{ category: string, service: string, priceRangeRaw: string, min: number, max: number, mid: number, score: number }>,
 * }}
 */
export function computePricingEstimate(description, catalog = getPricingCatalog()) {
  const descriptionNorm = normalizeText(description)
  if (!descriptionNorm) {
    return {
      totalMin: 0,
      totalMax: 0,
      totalMid: 0,
      currency: 'GBP',
      matches: [],
    }
  }

  const scored = catalog.map((row) => ({
    category: row.category,
    service: row.service,
    priceRangeRaw: row.priceRangeRaw,
    min: row.min,
    max: row.max,
    mid: row.mid,
    score: scoreRow(descriptionNorm, row),
  }))

  const sortedAll = scored.sort((a, b) => b.score - a.score)
  const strong = scored.filter((r) => r.score >= 5).sort((a, b) => b.score - a.score)
  const primary = strong[0] || sortedAll[0]
  if (!primary || primary.score < 2) {
    return { totalMin: 0, totalMax: 0, totalMid: 0, currency: 'GBP', matches: [] }
  }

  const runners = sortedAll.filter((r) => r !== primary).slice(0, 4)
  const matches = [primary, ...runners]

  return {
    totalMin: primary.min,
    totalMax: primary.max,
    totalMid: primary.mid,
    currency: 'GBP',
    matches,
  }
}

/**
 * @param {{ shortDescription?: string, extraDescription?: string, lineItems?: Array<{ product?: string, description?: string }> }} quoteLean
 * @param {string} [overrideDescription]
 */
export function buildPricingInputText(quoteLean, overrideDescription) {
  if (overrideDescription && String(overrideDescription).trim()) return String(overrideDescription).trim()
  const stripHtml = (html) => String(html || '').replace(/<[^>]+>/g, ' ')
  const lineBits = (quoteLean.lineItems || [])
    .map((li) => [li.product, li.description].filter(Boolean).join(' '))
    .filter(Boolean)
  return [
    quoteLean.shortDescription,
    stripHtml(quoteLean.extraDescription),
    ...lineBits,
  ]
    .filter(Boolean)
    .join('\n')
    .trim()
}
