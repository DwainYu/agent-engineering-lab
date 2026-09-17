---
id: 003-agent-loop
title: 迷你 Agent Loop
language: zh
source_revision: 1
summary: 用手写的 while 循环（transcript、工具注册表、退出判定、预算）跑一个多步任务，先别碰 LangGraph。
---

# Experiment 003 — 迷你 Agent Loop

## 目标

用手写的 `while` 循环跑一个多步任务 —— transcript、工具注册表、退出判定、预算 —— 在
碰 LangGraph 之前。

## 架构

```text
messages = [system, user]
loop:
  provider.complete(trim(messages, budget), registry.specs())
    ├─ tool_calls → invoke each → append tool observations → next turn
    └─ text only  → final answer, stop
guards: max_turns · max_tool_calls · repeat_limit
```

## 学到了什么

- 退出判定只有一行（`if not message.tool_calls`），而它是横在一个能用的 Agent 和一个
  `while True` 之间的唯一东西。
- Context 是**单调增长**的：这次四轮的运行结束时带了九条消息，而且每一轮都把全部消息
  重发一遍。步数便宜，token 不便宜。
- "记忆"当时是一个工具。`note_put` / `note_get` 是让第 4 轮能够依赖第 1 轮的最小的
  东西。
- 工具结果必须**按顺序**作为消息追加。只要有一次 observation 放错位置，下一次请求对
  模型来说就失去意义了。

## 结果

```text
$ python3 experiments/e03_agent_loop.py
answer        : The order total is 100.0.
turns         : 4   tool_calls: 3   messages: 9   tokens: 0 (scripted)
stop_reason   : final-answer
 1. system    'You are an agent that finishes tasks step by step…'
 2. user      'Compute 12.5 * 8, store the result under order_total…'
 3. assistant tool_calls=calculator({'expression': '12.5 * 8'})
 4. tool      '100.0'
 5. assistant tool_calls=note_put({'key': 'order_total', 'value': '100.0'})
 6. tool      'stored order_total'
 7. assistant tool_calls=note_get({'key': 'order_total'})
 8. tool      '100.0'
 9. assistant 'The order total is 100.0.'
```

三个不同的工具、四次模型调用、没有框架、200 行的循环。

### 在真实端点上

2026-09-12 跑在 ModelScope API-Inference（魔搭社区）上，模型
`Qwen/Qwen3.8-Flash-Next`，`enable_thinking: false`，`max_tokens: 1024`：

```text
$ python3 experiments/e03_agent_loop.py --real
answer        : The value is **100.0** — computed as 12.5 × 8, stored under the
                key `order_total`, and confirmed by reading it back.
turns         : 4
tool calls    : 3
messages      : 9 (grows every turn)
tokens        : 2698
stop reason   : final-answer
```

这次运行的脚本版花 8 个 token；真实版在同样四轮上花 2 698 个。比值约 340×，而且几乎
全部是重发的 context：历史加上 Experiment 001 里记录的那份 schema。正是这个数字，让
`token_budget` 成为一级控制项，而不是一个安全开关。

## 代码

- `agent/loop.py` — `Agent.run`、`AgentConfig`、三道护栏
- `agent/tools.py` — registry、校验、`note_put` / `note_get`
- `experiments/e03_agent_loop.py` — 本脚本

## 下一步

Experiment 004：故意让它失败 —— 错误的参数、未知的工具、卡住的循环、耗尽的预算、崩
溃的工具。
