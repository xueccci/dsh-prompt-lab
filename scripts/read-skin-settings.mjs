import { readFileSync } from 'node:fs'
const p = 'C:/Users/12852/.dsh/profiles/web/node_modules/@linxin666/dsh-client-ui-skin-center/lib/client.js'
const c = readFileSync(p, 'utf8')
// find settings.section registration context
const idx = c.indexOf('settings.section')
console.log('first idx', idx)
console.log(c.slice(Math.max(0, idx - 400), idx + 600))
// find more occurrences
let i = 0, n = 0
while ((i = c.indexOf('settings.section', i + 1)) !== -1 && n < 5) {
  n++
  console.log('--- occ', n, 'at', i)
  console.log(c.slice(Math.max(0, i - 200), i + 400))
}
