---
id: 005-context-trim
number: 5
title: Context Budget And Trimming
status: completed
language:
  - python
concepts:
  - agent-loop
  - agent-runtime
day: 1
training_project:
  repo: tft-agent-set18
  path: agent/context.py
---

# Experiment 005 — Context Budget And Trimming

## Goal

Grow the conversation until the runtime has to decide what to forget, and see
whether the task still completes.

## Architecture

```text
messages (grows every turn)
  ↓
estimate_tokens()  ≈ chars / 4 + 4 per message
  ↓
trim(budget)       keep system, drop oldest, always keep the current task
  ↓
provider.complete(request)      ← the model never sees what was dropped
```

## What I Learned

- Trimming is invisible to the model. It gets a shorter prompt and has no idea
  anything was removed — which is exactly how a "forgot the instructions" bug is
  born.
- The system prompt and the live task are the two things worth protecting;
  everything in between is negotiable. That ordering is a policy decision, not
  a fact about transformers.
- A fact that only exists in the prompt is temporary. `order_total` survived
  here because it lived in a tool (`note_get`), not because the model remembered
  it.
- Chars ÷ 4 is a bad tokenizer and a good budget signal. The estimate never has
  to be exact; it only has to be monotonic and cheap, because the decision it
  drives is "drop a turn or not".

## Result

```text
$ python3 experiments/e05_context_trim.py
history       : 40 messages
full estimate : 2165 tokens (budget 900)
trimmed       : 18 messages, 881 tokens
trim events   : 2 of 2 turns had to drop context
request #1    : 17 messages actually sent
answer        : order_total is 100.0.
stop reason   : final-answer
```

Twenty past turns were discarded and the task still completed. The same script
with a 40-token budget keeps only the system prompt plus the last turn — the
run still answers, but now the "memory" is provably the tool, not the context.

## Code

- `tft-agent-set18/agent/context.py` — `estimate_tokens`, `trim`
- `tft-agent-set18/agent/loop.py` — trimming applied per turn, `context_trimmed` event
- `tft-agent-set18/experiments/e05_context_trim.py`
- `tft-agent-set18/tests/test_context_trace.py` — system prompt and current task
  survive extreme pressure

## Next Step

Streaming and usage against a real endpoint (Day 02), then a summarising trim
instead of a deleting one.
