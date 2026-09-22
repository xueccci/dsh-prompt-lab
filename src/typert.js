/**
 * Host Typert manifest for dsh-prompt-lab (scanned by typert-loader via package export ./typert).
 * Codecs are zod v4 records; structural validation stays in service methods.
 */

import { z } from 'zod'

const argsSchema = z.record(z.string(), z.unknown())
const resultSchema = z.record(z.string(), z.unknown())

const args$codec = { mode: 'strict', typeSymbol: 'dsh-prompt-lab#Args', schema: argsSchema }
const result$codec = { mode: 'strict', typeSymbol: 'dsh-prompt-lab#Result', schema: resultSchema }

const invocation = (method) => ({
  id: 'dsh-prompt-lab#promptLab/' + method,
  service: 'promptLab',
  namespace: 'promptLab',
  method,
  invocation: { kind: 'direct' },
  parameters: [{ name: 'args', wire: 'args', source: 'json', codec: args$codec }],
  result: result$codec,
})

export const TYPERT = {
  package: 'dsh-prompt-lab',
  face: 'host',
  schemas: [],
  invocations: [
    invocation('getSettings'),
    invocation('setSettings'),
    invocation('optimizePrompt'),
    invocation('cancelOptimize'),
    invocation('testConnection'),
  ],
  model: {
    services: [
      {
        description:
          'dsh-prompt-lab Agent 结构化提示词优化服务 (ctx.promptLab)：本地骨架 + hybrid/DSH 精修。Agent-structured prompt optimization.',
        summary: 'dsh-prompt-lab 提示词优化服务 (dsh-prompt-lab prompt optimization service)。',
        tags: [],
        jsDoc: '/** dsh-prompt-lab 提示词优化服务 (ctx.promptLab)。 */',
        key: 'promptLab',
        exportName: 'PromptLabService',
        members: [
          {
            kind: 'method',
            name: 'getSettings',
            signature: 'getSettings(args: object): Promise<object>',
            summary: '读取工作区 L3 设置文件。Read the workspace L3 settings file.',
            jsDoc: '/**\n * 读取工作区 L3 设置文件。\n * @param args - { root }\n * @returns { ok, settings? } 或 { ok:false, error }\n */',
          },
          {
            kind: 'method',
            name: 'setSettings',
            signature: 'setSettings(args: object): Promise<object>',
            summary: '浅合并写入工作区 L3 设置。Shallow-merge settings into the workspace file.',
            jsDoc: '/**\n * 浅合并写入工作区 L3 设置。\n * @param args - { root, sessionId?, patch }\n * @returns { ok:true } 或 { ok:false, error? | reason?: "sandbox" }\n */',
          },
          {
            kind: 'method',
            name: 'optimizePrompt',
            signature: 'optimizePrompt(args: object): Promise<object>',
            summary:
              '按 Agent 结构（普通/精简/扩写）优化草稿：本地骨架 + hybrid/DSH 精修，失败降级。返回纯正文与输出分。Optimize draft; pure body + score; degrade on DSH fail.',
            jsDoc: '/**\n * Agent 结构化优化草稿。\n * @param args - { draft, mode?, engine?: "local"|"hybrid"|"dsh", useLoop?, runId? }\n * @returns { ok:true, text, score, layers, degraded, diagnostics, notes, source } 或 { ok:false, error }\n */',
          },
          {
            kind: 'method',
            name: 'cancelOptimize',
            signature: 'cancelOptimize(args: object): Promise<object>',
            summary: '按 runId 中止进行中的 LLM 优化。Abort an in-flight LLM optimize by runId.',
            jsDoc: '/**\n * 中止进行中的优化。\n * @param args - { runId }\n * @returns { ok:true } 或 { ok:false, error }\n */',
          },
          {
            kind: 'method',
            name: 'testConnection',
            signature: 'testConnection(args: object): Promise<object>',
            summary: '测试云端 API 连通性。Ping an OpenAI-compatible endpoint.',
            jsDoc: '/**\n * 测试云端 API。\n * @param args - { api: { baseUrl, apiKey?, model } }\n * @returns { ok:true, message } 或 { ok:false, error }\n */',
          },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
}

export default TYPERT
