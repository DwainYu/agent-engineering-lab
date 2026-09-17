---
id: 001-basic-llm
number: 1
title: One Model Turn
status: completed
revision: 1
language:
  - python
concepts:
  - llm-api
  - agent
day: 1
training_project:
  repo: tft-agent-set18
  path: agent/provider.py
---

# Experiment 001 — One Model Turn

## Goal

Call a chat-completions API with no framework and no helper library — standard
library only — and print exactly what comes back.

## Architecture

```text
prompt
  ↓
HTTP POST /chat/completions
  ↓
choices[0].message        → text
choices[0].finish_reason  → "stop"
usage                     → prompt / completion / total tokens
```

## What I Learned

- `usage` is the only cost signal there is. If the client does not record it,
  the Agent has no budget.
- `finish_reason` is part of the answer, not a diagnostic. `stop` and
  `length` mean completely different things to the caller.
- A model turn is stateless: the whole "conversation" is me resending the
  transcript every time.

## Result

```text
$ python3 experiments/e01_single_turn.py
provider      : scripted
tools offered : 4 (calculator, now, note_get, note_put)
messages      : 2
response      : role=assistant tool_calls=0 finish_reason=stop
usage         : Usage(prompt_tokens=0, completion_tokens=12)
```

Run on 2026-09-12 against ModelScope API-Inference (魔搭社区), model `Qwen/Qwen3.8-Flash-Next`, `enable_thinking: false`, `max_tokens: 1024`:

```text
$ python3 experiments/e01_single_turn.py --real
provider      : Qwen/Qwen3.8-Flash-Next@https://api-inference.modelscope.cn/v1
tools offered : 4 (calculator, note_get, note_put, now)
messages      : 2
response      : role=assistant tool_calls=0 finish_reason=stop
content       : An LLM agent is a language model that autonomously plans, uses
                tools, and takes multi-step actions to achieve a goal.
usage         : Usage(prompt_tokens=501, completion_tokens=26)
```

Two things only the live numbers told me:

- **The tool schemas are the prompt.** Same two messages, same endpoint, once
  with `tools` and once without:

  ```text
  without tools : prompt_tokens=37
  with 4 tools  : prompt_tokens=501      (+464, 13.5× the request)
  ```

  Four hand-written schemas cost more than twenty turns of dialogue would. "We
  ran out of context" is a tool-definition problem before it is a history
  problem, and the fix is fewer tools, not a bigger window.
- `completion_tokens` is the answer's length, nothing more. Accounting is only
  bookkeeping until something decides what to do when the running total crosses
  a budget — that decision is Day 05's `token_budget`.

## Code

Lives in the training project, not here:

- `tft-agent-set18/agent/provider.py` — `ScriptedProvider` (deterministic) and
  `OpenAICompatProvider` (stdlib HTTP, 429/5xx backoff, usage accounting)
- `tft-agent-set18/experiments/e01_single_turn.py` — this run

## Next Step

Experiment 002: add one tool and observe what changes in the response.
