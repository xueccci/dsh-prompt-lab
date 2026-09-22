import { readFileSync } from 'node:fs'
const c = readFileSync('G:/提示词优化器/dsh-prompt-lab/lib/client.js', 'utf8')
console.log('inject:', (c.match(/exports\.inject = .*/) || [])[0])
console.log('optionalService:', c.includes('optionalService'))
console.log('direct get workspaces:', /ctx\.get\(['"]workspaces['"]\)/.test(c))
console.log('load count:', (c.match(/window\.__ModuleLoader__\.load\(/g) || []).length)
