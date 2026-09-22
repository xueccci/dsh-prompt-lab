import { readFileSync } from 'node:fs'
const c = readFileSync('G:/提示词优化器/dsh-prompt-lab/lib/client.js', 'utf8')
const keys = [
  'settings.section',
  'prompt-lab',
  'runOptimize',
  '优化中',
  '普通优化',
  'LLM',
  'conversation.input.left',
  'exports.apply',
  'exports.inject',
]
for (const k of keys) console.log(k + ':', c.includes(k))
console.log('has toggle is-on btn class on button:', /plab-btn.*is-on/.test(c))
console.log('load', (c.match(/window\.__ModuleLoader__\.load\(/g) || []).length)
