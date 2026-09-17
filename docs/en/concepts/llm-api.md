---
id: llm-api
title: LLM API
language: en
revision: 1
category: fundamentals
status: learning
progress: 45
summary: "The single model turn behind every Agent: messages in, one reply out, plus usage, finish reason and tool calls."

prerequisites: []
related:
  - agent
  - tool-calling

experiments:
  - 001-basic-llm
  - 002-tool-calling

training_project:
  repo: tft-agent-set18
  path: agent/provider.py
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

- Training: `tft-agent-set18/agent/provider.py` — `OpenAICompatProvider`
  (ModelScope API-Inference at `https://api-inference.modelscope.cn/v1`, any
  OpenAI-compatible base URL works) and `ScriptedProvider` behind the same
  `complete(messages, tools)` interface, so experiments run offline.
- Production: `tft-agent-set17/api/` — streaming plus provider fallback.

## Measured

Numbers from running the real endpoint on 2026-09-12, not from documentation:

| Measurement                                          | Value                 |
| ---------------------------------------------------- | --------------------- |
| Same two messages, no `tools`                         | `prompt_tokens=37`     |
| Same two messages, four tool schemas                  | `prompt_tokens=501`    |
| One tool round trip (Experiment 002, 2 turns)         | 1 205 tokens           |
| Four-turn loop (Experiment 003)                       | 2 698 tokens           |
| Repeat of Experiment 002 at `temperature: 0`          | 4 runs, identical cost |
| `usage` fields actually returned                       | prompt / completion / total |

Three consequences for how the runtime is written:

- The schemas, not the conversation, are the biggest fixed cost in a prompt.
  Offer four tools and every turn pays for them; a tool-count budget is a token
  budget.
- Repeatability at `temperature: 0` is what lets a script stand in for a model.
  It held for the small tasks here; it did not hold for a trimmed, ambiguous
  task (Experiment 005 answered differently twice).
- Endpoint-specific knobs belong to the provider constructor (`enable_thinking`,
  `max_tokens`), never to the loop. An empty `content` with `tool_calls` set is
  normal; an empty `content` with `finish_reason: stop` is a model answering
  nothing, and only `usage` plus the finish reason tell those apart.

## Common Problems

- No timeout: a hung request looks like a slow Agent.
- Ignoring `finish_reason: "length"` and treating a truncated answer as final.
- Reusing one client for interactive and batch traffic, so latency budgets
  collide.
