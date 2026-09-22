import { readFileSync, writeFileSync } from 'node:fs'
const p = 'G:/提示词优化器/dsh-prompt-lab/src/shared.js'
let s = readFileSync(p, 'utf8')
const old = `  paras.push('**角色**：' + role + '。请直接按下列指令执行，不要复述指令本身。')`
const neu = `  paras.push('【Agent 结构化提示词】')
  paras.push('')
  paras.push('**角色**：' + role + '。请直接按下列指令执行，不要复述指令本身。')`
if (!s.includes(old)) throw new Error('role line not found')
s = s.replace(old, neu)
s = s.replace(
  `  if (constraints.length) {
    paras.push('**执行约束**：')
    for (const c of constraints) paras.push(c)
  }
  paras.push('**交付**：' + channelFormat(intent) + '。成品在前，说明在后（若有）。')
  return paras.join('\\n')
}`,
  `  paras.push('**执行约束**：')
  if (constraints.length) {
    for (const c of constraints) paras.push(c)
  } else {
    paras.push('- 不虚构数据、奖项与用户证言，缺信息标注「待补充」')
    paras.push('- 给出可直接使用的成品，而不是大纲')
    paras.push('- 禁止空话套话，语言具体可执行')
  }
  paras.push('**输出格式**：' + channelFormat(intent) + '。成品在前，说明在后（若有）。')
  paras.push('')
  paras.push('**过程/自检**：交付前检查角色是否匹配任务、约束是否可验收、格式是否完整。')
  return paras.join('\\n')
}`,
)
writeFileSync(p, s, 'utf8')
console.log('patched', s.includes('Agent 结构化提示词'), s.includes('过程/自检'))
