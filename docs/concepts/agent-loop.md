---
id: agent-loop
title: Agent Loop
category: runtime
status: learning
progress: 60
summary: The repeated cycle of model turn, tool execution and result injection, ending when the model answers or a budget stops it.

prerequisites:
  - agent
  - tool-calling
  - llm-api

related:
  - agent-runtime

experiments:
  - 002-tool-calling

training_project:
  repo: tft-agent-set18
  path: agent/loop.py

assist:
  language: zh
  mode: deep
---

# Agent Loop

## Definition

The Agent Loop is the cycle:

```text
transcript → model → (tool_calls?) → execute → results → transcript → ...
```

with two exits: the model produced a final answer, or the runtime refused to
continue (turn / token / time / cost budget).

## Why

The model is stateless and single-shot. Any multi-step behaviour therefore
has to come from the caller re-invoking it with a longer transcript. The loop
is what turns one stateless function into an apparently persistent worker.

> **中文理解**
>
> 模型没有状态，一次调用只出一次结果。所谓"连续工作"是调用方造出来的：每一轮
> 都把更长的 transcript 重新发一遍。所以 Agent Loop 不是模型的能力，而是
> runtime 外面套的那个循环。

## Minimal Implementation

The loop is five lines, but the interesting part is the exit test. The model
signals "I am done" by **not** asking for a tool. That is a weak signal: it
can also mean "I am confused". A robust runtime adds:

- a hard `max_turns`
- a repeated-call detector (same tool, same args)
- a token budget for the transcript itself

```python
seen: Counter[tuple[str, str]] = Counter()
for _ in range(max_turns):
    reply = llm.complete(messages, tools=tools)
    if not reply.tool_calls:
        return reply.content
    key = (reply.tool_calls[0].name, reply.tool_calls[0].arguments)
    if (seen[key] := seen[key] + 1) >= 3:
        raise Stuck(key)
    ...
```

> **中文深入理解**
>
> 难点在退出条件：模型表达"我做完了"的方式是**不再请求工具**，而这个信号很弱，
> 它同样可能意味着"我卡住了，不知道下一步怎么办"。
>
> 所以不能只信模型，要再加三层：
>
> - `max_turns`：轮数上限，只是刹车片
> - repeated-call detector：同一个 tool + 同一组 arguments 反复出现，判定为卡死
> - transcript 自身的 token budget
>
> 最小例子（Experiment 004）：模型连着三次调用同一个 `now`，前两次正常返回，
> 第三次被 repeat guard 拒掉并回一条 observation，运行结果是
> `stop_reason: stuck-loop`，但整轮仍能收敛到 final-answer。
>
> 常见误区：把 `max_turns` 当成防卡死机制。它区分不了"卡住"和"只是步骤多"，
> 做这个区分的是重复检测。

## Real Project

- Training: `tft-agent-set18/agent/loop.py`
- Production: `tft-agent-set17/api/agent/graph.py` — the loop becomes a
  conditional edge between nodes.

## Common Problems

- Ending on empty content and never telling the user why.
- Injecting tool results as `user` messages, which teaches the model to
  imitate tool output.
- No observability, so a stuck loop looks identical to a working one.
