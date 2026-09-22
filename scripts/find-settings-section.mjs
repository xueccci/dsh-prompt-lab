import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = [
  'C:/Users/12852/.dsh/profiles/web/node_modules',
  'G:/提示词优化器/dsh-prompt-lab/node_modules',
]
const hits = []
function walk(dir, depth = 0) {
  if (depth > 6 || hits.length > 30) return
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules' && depth > 2) continue
      walk(p, depth + 1)
    } else if (/\.(js|mjs|cjs|ts)$/.test(e.name)) {
      try {
        const st = statSync(p)
        if (st.size > 2_000_000) continue
        const c = readFileSync(p, 'utf8')
        if (c.includes("settings.section") && c.includes('slots')) {
          hits.push(p)
        }
      } catch {}
    }
  }
}
for (const r of roots) walk(r)
console.log(hits.slice(0, 20).join('\n'))
console.log('count', hits.length)
