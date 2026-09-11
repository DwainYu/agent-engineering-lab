---
id: agent
title: Agent
category: fundamentals
status: learning
progress: 45
summary: A program where the model chooses the next step at runtime, inside a loop that a runtime executes.
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

## Definition

An **Agent** is a program in which an LLM decides, at runtime, which step
comes next, and a surrounding runtime executes that decision and feeds the
result back. Contrast with a **Workflow**, where the sequence of steps is
fixed in code.

## Why

Some tasks cannot be decomposed ahead of time: the number of steps, and
which step follows, depend on what the previous result said. Writing that
branching in `if` statements does not scale, so the branch is moved into the
model's output and the runtime becomes a loop.

The cost of that trade is control. Every production Agent concern —
evaluation, budgets, tracing, guardrails — exists to buy control back.

## Minimal Implementation

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

Five parts, and only five: transcript, tool schemas, executor, loop
condition, budget.

## Real Project

- Training: `tft-agent-set18/agent/loop.py` — this minimal loop.
- Production: `tft-agent-set17/api/agent/graph.py` — the same loop expressed
  as a LangGraph state graph, with routing, checkpoints and streaming.

## Common Problems

- No termination condition other than "the model stopped answering".
- Tool results never written back into the transcript, so the model repeats
  the same call.
- Too many tools: selection accuracy drops before capability rises.
- Treating the Agent as a hammer, so simple two-step tasks get a loop.
