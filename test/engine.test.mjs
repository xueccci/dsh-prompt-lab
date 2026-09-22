/**
 * Host engine-path unit tests: local / hybrid / dsh degrade.
 * Mock ctx only — no DOM, no network.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../lib/index.js'

function makeCtx({ llm, defaultModel } = {}) {
  const provided = {}
  return {
    provided,
    get(key) {
      if (key === 'llm') return llm
      if (key === 'agentDefaultModel') return defaultModel
      if (key === 'fs') return undefined
      if (key === 'sessions') return undefined
      if (key === 'sandboxPolicy') return undefined
      if (key === 'timer') return undefined
      return undefined
    },
    provide(key, value) {
      provided[key] = value
    },
    effect() {},
    timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
  }
}

const DRAFT = '帮我写一篇小红书种草笔记，关于一款无线耳机，要好看一点，300字左右'

test('local engine returns pure body, not degraded', async () => {
  const ctx = makeCtx()
  apply(ctx)
  const r = await ctx.provided.promptLab.optimizePrompt({
    draft: DRAFT,
    mode: 'normal',
    engine: 'local',
  })
  assert.equal(r.ok, true)
  assert.equal(r.source, 'local')
  assert.equal(r.degraded, false)
  assert.equal(r.engineTried, 'local')
  assert.ok(!r.text.includes('【Agent 结构化提示词】'))
  assert.ok(!r.text.includes('过程/自检'))
  assert.equal(typeof r.score, 'number')
  assert.ok(r.layers && r.layers.role === true)
})

test('hybrid without DSH falls back local, not degraded', async () => {
  const ctx = makeCtx()
  apply(ctx)
  const r = await ctx.provided.promptLab.optimizePrompt({
    draft: DRAFT,
    mode: 'normal',
    engine: 'hybrid',
  })
  assert.equal(r.ok, true)
  assert.equal(r.source, 'local')
  assert.equal(r.degraded, false)
  assert.equal(r.engineTried, 'hybrid')
  assert.match(r.note, /本地/)
})

test('dsh without DSH degrades to local with yellow reason', async () => {
  const ctx = makeCtx()
  apply(ctx)
  const r = await ctx.provided.promptLab.optimizePrompt({
    draft: DRAFT,
    mode: 'normal',
    engine: 'dsh',
  })
  assert.equal(r.ok, true)
  assert.equal(r.source, 'local')
  assert.equal(r.degraded, true)
  assert.ok(r.llmError)
  assert.match(r.note, /降级/)
})

test('hybrid DSH fail degrades and still returns adoptable text', async () => {
  const llm = {
    listProviders: () => [{ id: 'p' }],
    listModels: async () => [{ id: 'm' }],
    stream() {
      throw new Error('boom')
    },
  }
  const ctx = makeCtx({
    llm,
    defaultModel: {
      currentSelection: () => ({ provider: 'p', model: 'm' }),
    },
  })
  apply(ctx)
  const r = await ctx.provided.promptLab.optimizePrompt({
    draft: DRAFT,
    mode: 'normal',
    engine: 'hybrid',
  })
  assert.equal(r.ok, true)
  assert.equal(r.source, 'local')
  assert.equal(r.degraded, true)
  assert.ok(r.llmError)
  assert.ok(r.text.length > 0)
})

test('hybrid DSH success returns polished pure body', async () => {
  const llm = {
    listProviders: () => [{ id: 'p' }],
    listModels: async () => [{ id: 'm' }],
    stream() {
      async function* gen() {
        yield { type: 'text-delta', text: '【Agent 结构化提示词】\n\n**角色**：资深文案。\n**任务**：写笔记。\n**过程/自检**：检查。' }
        yield { type: 'finish', reason: { kind: 'stop' } }
      }
      return gen()
    },
  }
  const ctx = makeCtx({
    llm,
    defaultModel: {
      currentSelection: () => ({ provider: 'p', model: 'm' }),
    },
  })
  apply(ctx)
  const r = await ctx.provided.promptLab.optimizePrompt({
    draft: DRAFT,
    mode: 'normal',
    engine: 'hybrid',
  })
  assert.equal(r.ok, true)
  assert.equal(r.source, 'hybrid')
  assert.equal(r.degraded, false)
  assert.ok(!r.text.includes('【Agent 结构化提示词】'))
  assert.ok(!r.text.includes('过程/自检'))
  assert.match(r.text, /\*\*角色\*\*/)
})

test('empty draft rejected', async () => {
  const ctx = makeCtx()
  apply(ctx)
  const r = await ctx.provided.promptLab.optimizePrompt({ draft: '   ', engine: 'local' })
  assert.equal(r.ok, false)
})

test('cancelOptimize aborts in-flight run', async () => {
  let aborted = false
  const llm = {
    listProviders: () => [{ id: 'p' }],
    listModels: async () => [{ id: 'm' }],
    stream({ signal }) {
      async function* gen() {
        await new Promise((resolve) => {
          const t = setTimeout(resolve, 5000)
          signal.addEventListener('abort', () => {
            aborted = true
            clearTimeout(t)
            resolve()
          })
        })
        yield { type: 'finish', reason: { kind: 'stop' } }
      }
      return gen()
    },
  }
  const ctx = makeCtx({
    llm,
    defaultModel: {
      currentSelection: () => ({ provider: 'p', model: 'm' }),
    },
  })
  apply(ctx)
  const runId = 'run-1'
  const p = ctx.provided.promptLab.optimizePrompt({
    draft: DRAFT,
    engine: 'hybrid',
    runId,
  })
  await new Promise((r) => setTimeout(r, 20))
  const c = await ctx.provided.promptLab.cancelOptimize({ runId })
  assert.equal(c.ok, true)
  const r = await p
  assert.equal(r.cancelled, true)
  assert.equal(aborted, true)
})
