import { readFileSync, writeFileSync } from 'node:fs'

const path = 'G:/提示词优化器/dsh-prompt-lab/src/client/index.js'
let raw = readFileSync(path, 'utf8')

const lines = raw.split('\n').filter((line) => {
  if (/^exports\b/.test(line)) return false
  if (/Object\.defineProperty\(exports/.test(line)) return false
  if (/const React = require\('react'\)/.test(line)) return false
  if (/window\.__ModuleLoader__\.load\(/.test(line)) return false
  if (/factory: \(require\)/.test(line)) return false
  return true
})
raw = lines.join('\n')

if (!raw.includes('export const inject')) {
  raw = raw.replace(/^const inject = /m, 'export const inject = ')
}
if (!raw.includes('export async function apply')) {
  raw = raw.replace(/^async function apply\(/m, 'export async function apply(')
}

writeFileSync(path, raw, 'utf8')

const c = readFileSync(path, 'utf8')
console.log('loader calls:', (c.match(/__ModuleLoader__\.load\(/g) || []).length)
console.log('export inject:', c.includes('export const inject'))
console.log('export apply:', c.includes('export async function apply'))
console.log('import React:', c.includes("import React from 'react'"))
console.log('require React:', c.includes("require('react')"))
console.log('exports. leftover:', /^exports\./m.test(c))
const L = c.split('\n')
console.log('---HEAD---')
console.log(L.slice(0, 20).join('\n'))
console.log('---TAIL---')
console.log(L.slice(-35).join('\n'))
