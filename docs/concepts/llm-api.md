---
id: llm-api
title: LLM API
category: fundamentals
status: learning
progress: 30
summary: "The single model turn behind every Agent: messages in, one reply out, plus usage, finish reason and tool calls."

prerequisites: []
related:
  - agent
  - tool-calling

experiments:
  - 001-basic-llm

training_project:
  repo: tft-agent-set18
  path: app/llm/
---

# LLM API

## Definition

One call to a chat-completions endpoint: a list of messages (plus tool
schemas, sampling parameters) in, one assistant reply out, with
`finish_reason` and `usage` attached.

## Why

Everything an Agent does is built on this one primitive repeated. If the
single-turn contract is not understood — what is stateless, what a message
role means, where tool calls appear — the loop above it is guesswork.

## Minimal Implementation

```python
payload = {
    "model": MODEL,
    "messages": [{"role": "user", "content": "What is an Agent?"}],
    "temperature": 0,
}
request = urllib.request.Request(
    f"{BASE_URL}/chat/completions",
    data=json.dumps(payload).encode(),
    headers={
        "content-type": "application/json",
        "authorization": f"Bearer {api_key}",
    },
)
data = json.loads(urllib.request.urlopen(request, timeout=60).read())
```

Non-negotiable extras: a timeout, `usage` accounting per turn, and retry with
backoff on 429 / 5xx.

## Real Project

- Training: `tft-agent-set18/app/llm/deepseek.py` and `app/llm/mock.py` — the
  same interface with a scripted provider so experiments run offline.
- Production: `tft-agent-set17/api/` — streaming plus provider fallback.

## Common Problems

- No timeout: a hung request looks like a slow Agent.
- Ignoring `finish_reason: "length"` and treating a truncated answer as final.
- Reusing one client for interactive and batch traffic, so latency budgets
  collide.
