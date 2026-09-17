---
id: 002-tool-calling
number: 2
title: One Tool Call, Round Trip
status: completed
revision: 1
language:
  - python
concepts:
  - tool-calling
  - agent-loop
day: 1
training_project:
  repo: tft-agent-set18
  path: agent/tools.py
---

# Experiment 002 — One Tool Call, Round Trip

## Goal

Make the model call a tool, execute it, and get back a natural-language
answer — in exactly one round trip, with no loop.

## Architecture

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

## What I Learned

- A tool call arrives as `message.tool_calls[]` with `arguments` still a
  **string**. Parsing is my job, and parse failures are the model's fault
  only in the sense that my schema description was unclear.
- `content` is `None` on that turn. Any runtime that ends the conversation on
  "empty answer" kills the Agent here.
- The `tool_call_id` back-reference is mandatory. Without it the model cannot
  tell which call a result belongs to once there is more than one.

## Result

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

Run on 2026-09-12 against ModelScope API-Inference (魔搭社区), model `Qwen/Qwen3.8-Flash-Next`, `enable_thinking: false`, `max_tokens: 1024`:

```text
$ python3 experiments/e02_tool_calling.py --real
answer        : (17 + 28) * 4 = 180
stop reason   : final-answer
turns / tools / tokens : 2 / 1 / 1205
observations  : 1
```

Same message shape as the scripted run — `finish_reason: tool_calls` on turn 1
with empty `content`, then a `tool` message, then the answer. I ran it four
times: identical `turns / tools / tokens` every time, same tool call, same
number. The only drift is phrasing — the live answer lost my scripted full stop.

Two things that follow. First, at `temperature: 0` this endpoint is repeatable
enough that the script in `ScriptedProvider` is a fair stand-in, which is what
lets the rest of the experiments stay deterministic. Second, 1 205 prompt tokens
bought one arithmetic call, because every turn re-sends the schemas measured in
Experiment 001.

What this run does *not* show is a model refusing to use the tool. It has always
called it here, so "no tool call means done" is still a signal I have only tested
with a script.

The `calculator` tool is an AST walk, not `eval()` — the model's argument
string is untrusted input, so parsing it is also a safety boundary.

## Code

- `tft-agent-set18/agent/tools.py` — registry, required/unexpected argument
  validation, `calculator`
- `tft-agent-set18/agent/loop.py` — one round trip inside the loop
- `tft-agent-set18/experiments/e02_tool_calling.py` — this run

## Next Step

Experiment 003: put this round trip inside a `while` loop and add a budget.
