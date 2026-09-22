import { readFileSync } from 'node:fs'
const c = readFileSync('G:/提示词优化器/dsh-prompt-lab/lib/client.js', 'utf8')
console.log('id reg:', c.includes('id: "dsh-prompt-lab"') || c.includes("id: 'dsh-prompt-lab'"))
console.log('key reg leftover:', c.includes('key: "dsh-prompt-lab"') || c.includes("key: 'dsh-prompt-lab'"))
console.log('apply start:', c.includes('client apply start'))
console.log('injecting log:', c.includes('injecting conversation.input.left'))
const i = c.indexOf('ctx.slots.inject')
console.log(c.slice(i, i + 280))
