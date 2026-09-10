---
day: 2
title: LLM API, Streaming And Usage
date: "2026-09-11"
status: learning
phase: fundamentals

topics:
  - llm-api
  - streaming
  - tokens

concepts:
  - llm-api
  - agent-loop

experiment:
  - 001-basic-llm

training_project:
  repo: tft-agent-set18
  path: app/llm/

difficulty: easy
estimated_time: 2h

commit_type: learning
---

# Day 02 — LLM API, Streaming And Usage

## Today's Goal

Write the LLM client myself: request, response, usage accounting, streaming
deltas, retry on 429 — so that `app/llm/` in Set 18 is code I understand
rather than code I borrowed.

## What I Learned

_In progress — filled in as I go._

## What I Didn't Understand

- How to reassemble a streamed tool call whose `arguments` arrive in
  fragments across SSE chunks.

## Experiment

See:

- `experiments/001-basic-llm/`

## My Own Explanation

_Pending._

## Key Takeaways

_Pending._

## Next

Day 03 — Agent State: why the message list is not enough.
