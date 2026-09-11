---
id: 001-basic-llm
number: 1
title: One Model Turn
status: completed
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

Against the real endpoint the same script takes `--real`, and `usage` stops
being a made-up number. I have not run that yet — no key in this environment —
so token accounting is the first thing to verify tomorrow.

## Code

Lives in the training project, not here:

- `tft-agent-set18/agent/provider.py` — `ScriptedProvider` (deterministic) and
  `OpenAICompatProvider` (stdlib HTTP, 429/5xx backoff, usage accounting)
- `tft-agent-set18/experiments/e01_single_turn.py` — this run

## Next Step

Experiment 002: add one tool and observe what changes in the response.
