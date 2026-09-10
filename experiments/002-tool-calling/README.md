---
id: 002-tool-calling
number: 2
title: One Tool Call, Round Trip
status: completed
language:
  - python
concepts:
  - tool-calling
  - agent-loop
day: 1
training_project:
  repo: tft-agent-set18
  path: app/tools/registry.py
---

# Experiment 002 — One Tool Call, Round Trip

## Goal

Make the model call a tool, execute it, and get back a natural-language
answer — in exactly one round trip, with no loop.

## Architecture

```text
User
  ↓
LLM (tools=[get_weather])
  ↓
tool_call  {"city": "上海"}
  ↓
Tool (python function)
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
$ python3 src/main.py --mock
[turn 1] finish=tool_calls  → get_weather({"city": "上海"})
[tool  ] {"city": "上海", "temperature_c": 24, "condition": "多云"}
[turn 2] finish=stop        → 上海 24°C，多云，穿件薄外套就够了。
```

## Code

- `tft-agent-set18/app/tools/weather.py`, `tft-agent-set18/app/tools/calculator.py`
- `tft-agent-set18/app/agent/tools.py` — the registry and dispatcher
- `tft-agent-set18/experiments/002_tool_calling.py`

## Next Step

Experiment 003: put this round trip inside a `while` loop and add a budget.
