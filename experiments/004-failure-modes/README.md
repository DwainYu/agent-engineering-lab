---
id: 004-failure-modes
number: 4
title: Failure Modes On Purpose
status: completed
revision: 1
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

# Experiment 004 — Failure Modes On Purpose

## Goal

Break the loop six different ways and check that each one ends with a named
stop reason instead of a stack trace or an infinite run.

## Architecture

```text
call → registry.invoke
         ├─ ok        → observation
         ├─ ToolError → "ERROR: …"   as observation
         ├─ Exception → "ERROR: … raised RuntimeError: …"
         └─ repeated  → "REFUSED: identical call …"
run  → stop_reason ∈ final-answer | tool-budget | max-turns
                | provider-error | tool-error
```

## What I Learned

- Model mistakes are **data**. A missing argument, an invented tool name and a
  crashed dependency all come back as text, and the run keeps going. The only
  design question is whether the text is informative enough to recover from —
  "Error" is worthless, `calculator: missing argument(s) expression` is not.
- The repeat guard matters more than the turn limit. A stuck model burns its
  whole `max_turns` budget on identical calls and still returns "success-ish";
  refusing the third identical call gives it a chance to change approach.
- Two budgets are needed, not one: turns bound the conversation, tool calls
  bound the blast radius _inside_ a turn (one assistant message can ask for six
  calls).
- `fail_on_tool_error` is a product decision, not a technical one: strict mode
  is right for a pipeline, wrong for an exploratory agent.

## Result

```text
$ python3 experiments/e04_failure_modes.py
1. invalid tool arguments      → ERROR: calculator: missing argument(s) expression
                                  recovery: "I need an expression to compute anything."
2. a tool that does not exist  → ERROR: unknown tool: web_search
                                  recovery: "That tool is unavailable…"
3. same call repeated          → REFUSED: identical call to now already made 2 times
4. no scripted turn left       → stop_reason: provider-error
5. more calls than allowed     → stop_reason: tool-budget   (tool_calls ≤ 2)
6. tool raises                 → ERROR: crash raised RuntimeError: database connection died

stop reasons:
  bad-arguments → final-answer    unknown-tool → final-answer
  stuck-loop    → final-answer    provider-error → provider-error
  tool-budget   → tool-budget     tool-crash   → final-answer
```

Recoveries reached `final-answer`; the two structural limits stopped the run
with a reason. That split is the whole point of a runtime.

### Why this notebook stays scripted

Every case here is built with `ScriptedProvider` even under `--real`. A failure
catalogue has to be reproducible: if the injected turn comes from a live model,
the case either does not happen today or happens differently tomorrow, and the
test that pins the stop reason becomes noise. The live endpoint contributes the
*shape* of these failures instead — `ProviderError` for a missing key, an HTTP
error class after three attempts with backoff, and an empty `content` turn that
carries only `tool_calls`.

What a live model does add is a new failure that no script invents: probing for
keys that do not exist (Experiment 005's real runs), which burns turns while
looking perfectly reasonable in the trace.

## Code

- `agent/loop.py` — `_dispatch`, `repeat_limit`, `max_tool_calls`
- `agent/provider.py` — `ProviderError`, retry/backoff, script exhaustion
- `experiments/e04_failure_modes.py`

## Next Step

Experiment 005: grow the history until the runtime has to decide what to
forget.
