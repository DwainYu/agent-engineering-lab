---
id: 003-agent-loop
number: 3
title: Mini Agent Loop
status: completed
language:
  - python
concepts:
  - agent-loop
  - tool-calling
  - agent-runtime
day: 1
training_project:
  repo: tft-agent-set18
  path: agent/loop.py
---

# Experiment 003 — Mini Agent Loop

## Goal

Run a multi-step task with a hand-written `while` loop — transcript, tool
registry, exit test, budgets — before touching LangGraph.

## Architecture

```text
messages = [system, user]
loop:
  provider.complete(trim(messages, budget), registry.specs())
    ├─ tool_calls → invoke each → append tool observations → next turn
    └─ text only  → final answer, stop
guards: max_turns · max_tool_calls · repeat_limit
```

## What I Learned

- The exit test is one line (`if not message.tool_calls`), and it is the only
  thing standing between a working agent and a `while True`.
- Context grows **monotonically**: this four-turn run carried nine messages by
  the end, and every turn re-sent all of them. Step count is cheap; token count
  is not.
- "Memory" was a tool. `note_put` / `note_get` are the smallest possible thing
  that lets turn 4 depend on turn 1.
- A tool result must be appended as a message _in order_. One misplaced
  observation and the next request stops making sense to the model.

## Result

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

Three different tools, four model calls, no framework, 200 lines of loop.

## Code

- `agent/loop.py` — `Agent.run`, `AgentConfig`, the three guards
- `agent/tools.py` — registry, validation, `note_put` / `note_get`
- `experiments/e03_agent_loop.py` — this script

## Next Step

Experiment 004: make it fail on purpose — bad arguments, unknown tools, a
stuck loop, an exhausted budget, a crashing tool.
