# dsh-prompt-lab

English | [中文](#提示词工坊--dsh-prompt-lab)

**Agent-structured prompt optimizer** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

Click **优化** in the composer → review a confirm modal (original | result | five-layer chips + output score) → **采用** writes the pure prompt body back. Cancel / Esc never touches the draft.

> **Data boundary:** Local mode never leaves the machine. hybrid / DSH polish sends the draft and local skeleton to the provider/model selected in DSH.

## Why not another “polish” button?

| | Generic polish plugins | **dsh-prompt-lab** |
|--|-------------------------|---------------------|
| Method | Ask the model to rewrite once | **Agent ladder** structure first |
| Modes | Many strategy labels | **普通 / 精简 / 扩写** |
| Offline | Needs a model | **Local rules** produce structured output |
| Confirm | Silent write-back | Modal + score + adopt/cancel |
| Failure | Hard fail | **Degrade to local** with a yellow banner |

## Install

```bash
dsh plugin --profile web add github:xueccci/dsh-prompt-lab#v0.1.0
```

Restart the profile’s Web process (and `Ctrl+Shift+R` in the browser), then verify:

```bash
dsh --profile web --dump-config | findstr dsh-prompt-lab
```

## Usage

1. Type a draft in the composer.
2. Click **优化** (or `Ctrl/Cmd+Enter`).
3. Review modal: original | result | ✓/✗ five layers + **输出分**.
4. **采用** writes back pure body only if the draft is unchanged; otherwise keep the draft.

| Mode | Behavior |
|------|----------|
| **普通优化** | Rewrite into Agent structure (role/task/context/constraints/format) |
| **精简** | Extract trunk: core task + hard constraints + deliverable |
| **扩写** | Expand only needs the user named |

| Engine | Behavior |
|--------|----------|
| **仅本地** | Offline rules, never calls a model |
| **hybrid** (default) | Local skeleton → DSH polish when provider+model resolve |
| **仅DSH** | Prefer DSH; on missing model / fail → local + yellow banner |

## Settings

```
设置 → 提示词工坊
├─ 引擎：仅本地 | hybrid(默认) | 仅DSH
├─ 模式：普通优化 | 精简 | 扩写
├─ 推理行为：自循环 · 快捷键(默认开)
└─ 关于：xueccci · 提示词工坊 dsh 插件
```

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

输入栏点「优化」→ **确认弹窗**（原稿｜结果｜五层诊断 + 输出分）→ **采用** 写回纯提示词正文。取消 / Esc **绝不改草稿**。本地规则离线可用；hybrid / DSH 精修走已配置模型，失败 **降级黄条** 仍可采用。

### 安装

```bash
dsh plugin --profile web add github:xueccci/dsh-prompt-lab#v0.1.0
```

安装后重启 Web 进程，输入栏左侧应出现 **优化** 按钮。

### 交互

| 操作 | 行为 |
|------|------|
| 点「优化」/ `Ctrl/Cmd+Enter` | 跑完出 modal，不直接写回 |
| 采用 | 写回输入框 + toast「已写入」；草稿已变则防覆盖 |
| 取消 / Esc / × | 绝不改草稿 |
| 空稿 | toast「请先输入提示词草稿」 |
| 优化中再点 | 取消进行中的优化 |

写回内容为**纯提示词正文**（无 `【Agent 结构化提示词】`、无「过程/自检」）。

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

超时：**idle 15s / 总 60s**。

### 设置

仅四块：引擎 / 模式 / 推理行为（自循环 + 快捷键默认开）/ 关于。

### 数据边界

- **本地模式**：草稿不出本机
- **hybrid / DSH 精修**：草稿与本地骨架会发给 DSH 已配置的模型服务商

### 开发

```bash
pnpm install && pnpm build && pnpm check
```

MIT · 社区独立插件 · 与 DeepSeek AI 无隶属关系。
