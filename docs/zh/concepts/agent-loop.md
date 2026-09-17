---
id: agent-loop
title: Agent Loop
category: runtime
status: learning
progress: 60
language: zh
source_revision: 1
summary: 模型调用、工具执行、结果注入的重复循环，直到模型给出答案或预算把它拦下。

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
---

# Agent Loop：Agent 执行循环

## 定义

Agent Loop 就是下面这条循环：

```text
transcript → model → (tool_calls?) → execute → results → transcript → ...
```

它有两个出口：模型产出了最终答案，或者 runtime 拒绝继续（轮数 / token / 时间 / 成本
预算）。

## 为什么需要它

模型没有状态，一次调用只出一次结果。所谓"连续工作"是调用方造出来的：每一轮都把更长的
transcript 重新发一遍。所以 Agent Loop 不是模型的能力，而是 runtime 外面套的那个循
环 —— 是它把一个无状态函数变成了一个看起来有持续性的工人。

## 最小实现

循环本体只有五行，有意思的是退出判定。模型表达"我做完了"的方式是**不再请求工具**，
而这个信号很弱，它同样可能意味着"我卡住了，不知道下一步怎么办"。所以一个结实的
runtime 还要再加三层：

- 硬性的 `max_turns`
- 重复调用检测（同一个 tool，同一组 args）
- transcript 自身的 token budget

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

## 补充理解

最小例子（Experiment 004）：模型连着三次调用同一个 `now`，前两次正常返回，第三次被
repeat guard 拒掉并回一条 observation，运行结果是 `stop_reason: stuck-loop`，但整轮
仍能收敛到 final-answer。

常见误区：把 `max_turns` 当成防卡死机制。它区分不了"卡住"和"只是步骤多"，做这个区分
的是重复检测。

再强调一次循环的形状 —— 模型进行决策 → 调用工具 → 获取工具结果 → 更新状态 → 再一次
调用模型，直到满足明确的终止条件。

## 真实项目里

- Training：`tft-agent-set18/agent/loop.py`
- Production：`tft-agent-set17/api/agent/graph.py` — 循环变成了节点之间的条件边。

## 常见问题

- 以空 content 收尾，而且从不告诉用户为什么。
- 把工具结果当成 `user` 消息注入，这等于在教模型模仿工具输出。
- 没有可观测性，所以卡住的循环和正常的循环看起来一模一样。
