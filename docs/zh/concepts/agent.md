---
id: agent
title: Agent
category: fundamentals
status: learning
progress: 45
language: zh
source_revision: 1
summary: 一种程序：由模型在运行时决定下一步做什么，外面套一个负责执行的 runtime。

source: https://www.anthropic.com/engineering/building-effective-agents

prerequisites: []
related:
  - agent-loop
  - tool-calling

experiments:
  - 001-basic-llm
  - 002-tool-calling

training_project:
  repo: tft-agent-set18
  path: agent/loop.py

production_project:
  repo: tft-agent-set17
  path: api/agent/graph.py
---

# Agent

## 定义

**Agent** 是这样一种程序：由 LLM 在运行时决定下一步是什么，外面套一层 runtime 去
执行这个决定，并把结果喂回来。对照 **Workflow**：Workflow 的步骤顺序是写死在代码里
的。

## 为什么需要它

有些任务没法提前拆解：需要几步、下一步是哪一步，取决于上一步的结果说了什么。把这种
分支写成 `if` 语句是撑不住的，于是分支被搬进了模型的输出里，而 runtime 就退化成一个
循环。

这个交换的代价是控制权。生产环境里所有关于 Agent 的考量 —— evaluation、budget、
tracing、guardrail —— 都是用来把控制权买回来的。

## 最小实现

```python
def agent(goal: str, tools: list[Tool], max_turns: int = 8) -> str:
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_turns):
        reply = llm.complete(messages, tools=tools)
        if not reply.tool_calls:
            return reply.content or ""
        messages.append(reply.to_message())
        messages.extend(tools.run(reply.tool_calls))
    raise Budget("max_turns")
```

五个部件，只有五个：transcript、tool schemas、executor、loop condition、budget。

## 真实项目里

- Training：`tft-agent-set18/agent/loop.py` — 就是上面这个最小循环。
- Production：`tft-agent-set17/api/agent/graph.py` — 同样的循环，用 LangGraph 的
  state graph 表达，外加路由、checkpoint 和 streaming。

## 常见问题

- 除了"模型不回答了"之外，没有别的终止条件。
- 工具结果从不写回 transcript，于是模型重复同一个调用。
- 工具太多：还没等能力涨上来，选择准确率先掉了。
- 把 Agent 当锤子，两步就能做完的事也上循环。
