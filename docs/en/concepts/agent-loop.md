---
id: agent-loop
title: Agent Loop
language: en
revision: 1
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

## Real Project

- Training: `tft-agent-set18/agent/loop.py`
- Production: `tft-agent-set17/api/agent/graph.py` — the loop becomes a
  conditional edge between nodes.

## Common Problems

- Ending on empty content and never telling the user why.
- Injecting tool results as `user` messages, which teaches the model to
  imitate tool output.
- No observability, so a stuck loop looks identical to a working one.
