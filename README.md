# dsh-prompt-lab

English | [中文](#提示词工坊--dsh-prompt-lab)

**Agent-structured prompt optimizer** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

Click **优化** in the composer to rewrite the current draft into an executable Agent pipeline — **role / task / context / constraints / output format** — then review the result in a confirm modal (original | result | five-layer chips + output score). Local rules always work offline; optional LLM polish uses the model already configured in DSH or a cloud API.

> **Data boundary:** Local mode never leaves the machine. hybrid / DSH / cloud-API polish sends the draft and local skeleton to the configured provider.

> **Requires DSH `>= 0.2.0-rc.2`** (Typert strict codecs now need a `create()` factory, and model metadata is read through `llm.resolveModelInfo()`).

## What it does

| | Generic polish plugins | **dsh-prompt-lab** |
|--|-------------------------|---------------------|
| Method | Ask the model to rewrite once | **Agent ladder** structure first |
| Modes | Many strategy labels | **普通优化 / 精简 / 扩写** |
| Offline | Needs a model | **Local rules** produce structured output |
| Confirm | Silent write-back | Modal + score + explicit actions |
| Failure | Hard fail | **Degrade to local** with a yellow banner |

### Modal actions

| Action | Behavior |
|--------|----------|
| **继续优化** | Re-run the same optimize pipeline on the editable draft pane |
| **回填输入** | Copy the result into the draft pane for secondary editing |
| **采用** | Write the draft pane back to the composer (`已写入`) |
| **复制** | Copy the result to clipboard |
| **取消 / Esc** | Never touch the composer draft |

### Engines

| Engine | Behavior |
|--------|----------|
| **仅本地** | Offline rules, never calls a model |
| **hybrid** (default) | Local skeleton → DSH polish when provider+model resolve |
| **仅DSH** | Prefer DSH; on missing model / fail → local + yellow banner |
| **云端 API** | OpenAI-compatible HTTP (DeepSeek or custom); fail → local + yellow banner |

Timeouts: idle 15s / total 60s.

## Install

```bash
dsh plugin --profile web add github:xueccci/dsh-prompt-lab#v0.2.0
```

Restart the profile’s Web process (and `Ctrl+Shift+R` in the browser), then verify:

```bash
dsh --profile web --dump-config | findstr dsh-prompt-lab
```

## Usage

1. Type a draft in the composer.
2. Click **优化** (or `Ctrl/Cmd+Enter`).
3. Review the modal; edit the draft pane, **继续优化**, or **回填输入**.
4. **采用** writes the draft pane back only if the composer draft is unchanged.

| Mode | Behavior |
|------|----------|
| **普通优化** | Rewrite into Agent structure (role/task/context/constraints/format) |
| **精简** | Extract trunk: core task + hard constraints + deliverable |
| **扩写** | Expand only needs the user named |

## Settings

```
设置 → 提示词工坊
├─ 引擎：仅本地 | hybrid(默认) | 仅DSH | 云端 API
├─ 模式：普通优化 | 精简 | 扩写
├─ 云端 API：Base URL / Key / 模型 · 测试连接
├─ 推理行为：自循环 · 快捷键(默认开)
└─ 关于：xueccci · 提示词工坊 dsh 插件
```

Cloud API keys stay in browser `localStorage` and are not written to workspace files.

## Development

```bash
pnpm install
pnpm build          # tsdown → lib/
pnpm check          # unit tests + syntax check
```

## License

MIT · Independent community plugin · Not affiliated with DeepSeek AI.

See [NOTICE](./NOTICE).

---

## 提示词工坊 · dsh-prompt-lab

面向 DeepSeek Harness 的 **Agent 结构化提示词优化插件**。

> **需要 DSH `>= 0.2.0-rc.2`**（Typert 严格 codec 必须有 `create()` 工厂；模型元数据改走 `llm.resolveModelInfo()`）。

输入栏点「优化」→ **确认弹窗**（原稿｜结果｜五层诊断 + 输出分）。左侧原稿可编辑，支持 **继续优化** / **回填输入**；**采用** 写回输入框；取消 / Esc **绝不改草稿**。本地规则离线可用；hybrid / DSH / 云端 API 精修失败时 **降级黄条**，仍可处理结果。

### 安装

```bash
dsh plugin --profile web add github:xueccci/dsh-prompt-lab#v0.2.0
```

安装后重启 Web 进程，输入栏左侧应出现 **优化** 按钮。

### 弹窗操作

| 操作 | 行为 |
|------|------|
| **继续优化** | 对左侧原稿再跑一轮（与「优化」同一逻辑） |
| **回填输入** | 右侧结果填入左侧原稿，便于二次编辑 |
| **采用** | 左侧原稿写回输入框 + toast「已写入」 |
| **复制** | 复制右侧结果 |
| **取消 / Esc / ×** | 绝不改草稿 |

### 模式 / 引擎

| 模式 | 行为 |
|------|------|
| 普通优化 | 按 Agent 结构改写 |
| 精简 | 提取主干（任务+硬约束+交付） |
| 扩写 | 只细化用户点名的需求 |

| 引擎 | 行为 |
|------|------|
| 仅本地 | 离线规则，不出机 |
| hybrid（默认） | 本地骨架 → 有 provider+model 才精修 |
| 仅DSH | 优先 DSH；失败/无模型降级本地 + 黄条 |
| 云端 API | OpenAI 兼容 HTTP；失败降级本地 + 黄条 |

超时：**idle 15s / 总 60s**。

### 设置

引擎 / 模式 / 云端 API（含测试连接）/ 推理行为（自循环 + 快捷键默认开）/ 关于。

### 数据边界

- **本地模式**：草稿不出本机
- **hybrid / DSH / 云端 API**：草稿与本地骨架会发给所配置的模型服务商

### 开发

```bash
pnpm install && pnpm build && pnpm check
```

MIT · 社区独立插件 · 与 DeepSeek AI 无隶属关系。
