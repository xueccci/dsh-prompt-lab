/**
 * Unit tests for shared local optimizer (no DOM / no host).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  diagnosePrompt,
  extractIntent,
  detectTaskType,
  optimizeLocal,
  modeSystemPrompt,
  stripOuterFence,
  toPureBody,
  canAdoptResult,
  MODES,
} from '../lib/shared.js'

test('MODES has three workshop modes', () => {
  assert.deepEqual([...MODES], ['normal', 'slim', 'expand'])
})

test('empty draft rejected', () => {
  const r = optimizeLocal('   ', 'normal')
  assert.equal(r.ok, false)
})

test('normal mode produces Agent structure labels', () => {
  const r = optimizeLocal('帮我写一篇小红书种草笔记，关于一款无线耳机，要好看一点，300字左右', 'normal')
  assert.equal(r.ok, true)
  assert.equal(r.source, 'local')
  assert.match(r.text, /\*\*角色\*\*/)
  assert.match(r.text, /\*\*任务\*\*/)
  assert.match(r.text, /\*\*输出格式\*\*|\*\*交付\*\*/)
  assert.match(r.text, /【Agent 结构化提示词】/)
  assert.ok(r.diagnostics.score > 0)
  assert.ok(r.notes.length > 0)
})

test('slim mode extracts trunk markers', () => {
  const draft =
    '你好！麻烦帮我写一个关于新上市咖啡机的产品介绍，要专业一点，不要虚构参数，大概400字以内，谢谢！'
  const r = optimizeLocal(draft, 'slim')
  assert.equal(r.ok, true)
  assert.match(r.text, /【主干】/)
  assert.match(r.text, /【交付】/)
  assert.ok(!r.text.includes('谢谢'))
})

test('expand mode uses need sections', () => {
  const r = optimizeLocal('写一篇面向上班族的公众号推文，介绍一款便携咖啡杯', 'expand')
  assert.equal(r.ok, true)
  assert.match(r.text, /## 需求细化/)
  assert.match(r.text, /## 交付/)
  assert.match(r.text, /## 自检/)
})

test('diagnose finds missing layers on bare draft', () => {
  const d = diagnosePrompt('弄一下那个事')
  assert.equal(d.layers.role, false)
  assert.ok(d.issues.length >= 3)
  assert.ok(d.score < 80)
})

test('extractIntent detects xhs channel', () => {
  const intent = extractIntent('写一篇小红书笔记')
  assert.ok(intent.channels.includes('xhs'))
})

test('detectTaskType matches code', () => {
  const t = detectTaskType('写一个 Python 函数解析 CSV')
  assert.equal(t.id, 'code')
})

test('modeSystemPrompt includes mode-specific rules', () => {
  assert.match(modeSystemPrompt('normal'), /角色、任务/)
  assert.match(modeSystemPrompt('slim'), /【主干】/)
  assert.match(modeSystemPrompt('expand'), /需求细化/)
  assert.match(modeSystemPrompt('normal', true), /自循环/)
})

test('stripOuterFence unwraps markdown fence', () => {
  assert.equal(stripOuterFence('```markdown\nhello\n```'), 'hello')
  assert.equal(stripOuterFence('hello'), 'hello')
})

test('toPureBody strips workshop banner and process section', () => {
  const r = optimizeLocal('帮我写一篇小红书种草笔记，关于一款无线耳机，要好看一点，300字左右', 'normal')
  assert.equal(r.ok, true)
  const pure = toPureBody(r.text)
  assert.ok(!pure.includes('【Agent 结构化提示词】'))
  assert.ok(!pure.includes('过程/自检'))
  assert.match(pure, /\*\*角色\*\*/)
  assert.match(pure, /\*\*任务\*\*/)
})

test('toPureBody strips expand self-check tail', () => {
  const body = '## 原始需求\n写一篇推文\n\n## 需求细化\n### 渠道\n- x\n\n## 交付\n- 成品\n\n## 自检\n1. 是否覆盖'
  const pure = toPureBody(body)
  assert.ok(!pure.includes('## 自检'))
  assert.match(pure, /## 交付/)
})

test('canAdoptResult guards draft overwrite', () => {
  assert.equal(canAdoptResult('abc', 'abc'), true)
  assert.equal(canAdoptResult('abc', 'abd'), false)
  assert.equal(canAdoptResult('abc', 'abc '), false)
})
