---
id: 001-basic-llm
title: 一次模型调用
language: zh
source_revision: 1
summary: 不用框架、不用辅助库（只用标准库）打一次 chat-completions API，把返回的东西原样打印出来。
---

# Experiment 001 — 一次模型调用

## 目标

不借助任何框架和辅助库、只用标准库，调用一次 chat-completions API，并把返回内容原样
打印出来。

## 架构

```text
prompt
  ↓
HTTP POST /chat/completions
  ↓
choices[0].message        → text
choices[0].finish_reason  → "stop"
usage                     → prompt / completion / total tokens
```

## 学到了什么

- `usage` 是唯一的成本信号。如果 client 不记录它，Agent 就没有预算可言。
- `finish_reason` 是答案的一部分，不是诊断信息。`stop` 和 `length` 对调用方来说完全是
  两回事。
- 一次模型调用是无状态的：所谓"对话"就是我每次都把 transcript 重发一遍。

## 结果

```text
$ python3 experiments/e01_single_turn.py
provider      : scripted
tools offered : 4 (calculator, now, note_get, note_put)
messages      : 2
response      : role=assistant tool_calls=0 finish_reason=stop
usage         : Usage(prompt_tokens=0, completion_tokens=12)
```

2026-09-12 跑在 ModelScope API-Inference（魔搭社区）上，模型
`Qwen/Qwen3.8-Flash-Next`，`enable_thinking: false`，`max_tokens: 1024`：

```text
$ python3 experiments/e01_single_turn.py --real
provider      : Qwen/Qwen3.8-Flash-Next@https://api-inference.modelscope.cn/v1
tools offered : 4 (calculator, note_get, note_put, now)
messages      : 2
response      : role=assistant tool_calls=0 finish_reason=stop
content       : An LLM agent is a language model that autonomously plans, uses
                tools, and takes multi-step actions to achieve a goal.
usage         : Usage(prompt_tokens=501, completion_tokens=26)
```

有两件事只有真实数字能告诉我：

- **工具的 schema 本身就是 prompt。** 同样的两条消息、同一个端点，一次带 `tools`，
  一次不带：

  ```text
  without tools : prompt_tokens=37
  with 4 tools  : prompt_tokens=501      (+464，请求的 13.5 倍)
  ```

  四个手写 schema 的开销，比二十轮对话还大。"context 不够用了"在它变成一个历史问题
  之前，首先是一个工具定义问题；修法是减少工具，而不是加大窗口。
- `completion_tokens` 只是答案的长度，没有更多含义。在有东西决定"累计用量跨过预算时该
  怎么办"之前，统计只是记账 —— 那个决定是 Day 05 的 `token_budget`。

## 代码

代码在训练项目里，不在这里：

- `tft-agent-set18/agent/provider.py` — `ScriptedProvider`（确定性）和
  `OpenAICompatProvider`（stdlib HTTP，429/5xx backoff，用量统计）
- `tft-agent-set18/experiments/e01_single_turn.py` — 本次运行

## 下一步

Experiment 002：加一个工具，观察响应里有什么变化。
