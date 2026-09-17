---
id: 002-tool-calling
title: 一次工具调用，一次往返
language: zh
source_revision: 1
summary: 让模型调用一个工具，执行它，再拿回一句自然语言答案 —— 只走一次往返，不用循环。
---

# Experiment 002 — 一次工具调用，一次往返

## 目标

让模型调用一个工具、执行它，并拿回一句自然语言答案 —— 只走一次往返，没有循环。

## 架构

```text
User
  ↓
LLM (tools=[calculator, now, note_put, note_get])
  ↓
tool_call  calculator {"expression": "(17 + 28) * 4"}
  ↓
Tool (validated args → python function)
  ↓
tool result (role=tool, tool_call_id=...)
  ↓
LLM
  ↓
Answer
```

## 学到了什么

- 工具调用以 `message.tool_calls[]` 的形式到达，`arguments` 仍然是一个**字符串**。解析
  是我的活；解析失败只在"我的 schema 描述没写清楚"这个意义上算模型的错。
- 那一轮的 `content` 是 `None`。任何用"答案为空"来结束对话的 runtime，都会在这里把
  Agent 掐死。
- `tool_call_id` 这个反向引用是强制的。一旦调用超过一个，没有它模型就分不清结果属于哪
  一次调用。

## 结果

```text
$ python3 experiments/e02_tool_calling.py
answer        : (17 + 28) * 4 = 180.
stop reason   : final-answer
observations  : 1

 1. system     'You are an agent that finishes tasks step by step…'
 2. user       'What is (17 + 28) * 4? Use the calculator tool…'
 3. assistant  tool_calls=calculator({'expression': '(17 + 28) * 4'})
 4. tool       '180'
 5. assistant '(17 + 28) * 4 = 180.'
```

2026-09-12 跑在 ModelScope API-Inference（魔搭社区）上，模型
`Qwen/Qwen3.8-Flash-Next`，`enable_thinking: false`，`max_tokens: 1024`：

```text
$ python3 experiments/e02_tool_calling.py --real
answer        : (17 + 28) * 4 = 180
stop reason   : final-answer
turns / tools / tokens : 2 / 1 / 1205
observations  : 1
```

消息的形状和脚本化运行完全一致 —— 第 1 轮 `finish_reason: tool_calls` 且 `content`
为空，然后一条 `tool` 消息，然后是答案。我跑了四次：`turns / tools / tokens` 每次都一模
一样，同样的工具调用、同样的数字。唯一会漂的是措辞 —— 真实回答把我脚本里那个句号给
丢了。

由此有两件事。第一，在 `temperature: 0` 下这个端点的可重复性足够好，好到
`ScriptedProvider` 里的脚本是个公平的替身，这也让其余实验可以保持确定性。第二，
1 205 个 prompt token 换来了一次算术调用，因为每一轮都要重发 Experiment 001 里测出来
的那份 schema。

这次运行**没有**覆盖的是"模型拒绝使用工具"。它在这里一直都会调用，所以"没有工具调用
就意味着结束"这个信号，我目前还只用脚本验证过。

`calculator` 工具是一次 AST 遍历，不是 `eval()` —— 模型给的参数字符串是不可信输入，
所以解析它同时也是一道安全边界。

## 代码

- `tft-agent-set18/agent/tools.py` — registry、必填 / 多余参数校验、`calculator`
- `tft-agent-set18/agent/loop.py` — 循环内的一次往返
- `tft-agent-set18/experiments/e02_tool_calling.py` — 本次运行

## 下一步

Experiment 003：把这个往返放进 `while` 循环，并加上预算。
