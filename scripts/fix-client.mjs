import { readFileSync, writeFileSync } from 'node:fs'

const path = 'G:/提示词优化器/dsh-prompt-lab/src/client/index.js'
let raw = readFileSync(path, 'utf8')

const hasLoader = raw.includes('window.__ModuleLoader__.load')

if (hasLoader) {
  const cssIdx = raw.indexOf('const css = ')
  if (cssIdx < 0) throw new Error('css not found')
  const expDef = raw.lastIndexOf('exports.default')
  if (expDef < 0) throw new Error('exports.default not found')

  let body = raw.slice(cssIdx, expDef)
  body = body
    .split('\n')
    .filter((line) => {
      if (/^\s*exports\./.test(line)) return false
      if (/Object\.defineProperty\(exports/.test(line)) return false
      if (/const React = require\('react'\)/.test(line)) return false
      if (/var module = \{ exports/.test(line)) return false
      if (/var exports = module/.test(line)) return false
      if (/window\.__ModuleLoader__/.test(line)) return false
      return true
    })
    .join('\n')
  body = body
    .split('\n')
    .map((l) => (l.startsWith('    ') ? l.slice(4) : l))
    .join('\n')
  body = body
    .replace(/^const inject = /m, 'export const inject = ')
    .replace(/^async function apply\(/m, 'export async function apply(')

  const header = [
    '/**',
    ' * dsh-prompt-lab browser client (ESM source).',
    ' * tsdown banner wraps this into a single __ModuleLoader__.load factory.',
    ' * Slot: conversation.input.left',
    ' */',
    '',
    "import React from 'react'",
    '',
    '',
  ].join('\n')

  let out = header + body.trimEnd() + '\n'
  if (!out.includes('export const inject')) {
    out = out.replace(/^const inject = /m, 'export const inject = ')
  }
  if (!out.includes('export async function apply')) {
    out = out.replace(/^async function apply\(/m, 'export async function apply(')
  }
  writeFileSync(path, out, 'utf8')
  raw = out
} else {
  if (!raw.includes("import React from 'react'")) {
    if (raw.includes("require('react')")) {
      raw = raw.replace("const React = require('react')", "import React from 'react'")
    }
  }
  raw = raw.replace(/^const inject = /m, 'export const inject = ')
  raw = raw.replace(/^async function apply\(/m, 'export async function apply(')
  writeFileSync(path, raw, 'utf8')
}

const check = readFileSync(path, 'utf8')
const loadCount = (check.match(/__ModuleLoader__\.load/g) || []).length
console.log('ModuleLoader.load count:', loadCount)
console.log('export inject:', check.includes('export const inject'))
console.log('export apply:', check.includes('export async function apply'))
console.log('import React:', check.includes("import React from 'react'"))
console.log('require react:', check.includes("require('react')"))
const lines = check.split('\n')
console.log('---HEAD---')
console.log(lines.slice(0, 30).join('\n'))
console.log('---TAIL---')
console.log(lines.slice(-25).join('\n'))
console.log('lines:', lines.length)
