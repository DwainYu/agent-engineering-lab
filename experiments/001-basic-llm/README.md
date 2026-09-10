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
  path: app/llm/deepseek.py
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
$ DEEPSEEK_API_KEY=*** python3 src/main.py
finish_reason : stop
prompt_tokens : 21
completion    : 148
answer        : An Agent is a program that …
```

## Code

Lives in the training project, not here:

- `tft-agent-set18/app/llm/deepseek.py` — the real client
- `tft-agent-set18/app/llm/mock.py` — scripted provider, so this experiment
  also runs with no key
- `tft-agent-set18/experiments/001_basic_llm.py`

## Next Step

Experiment 002: add one tool and observe what changes in the response.
