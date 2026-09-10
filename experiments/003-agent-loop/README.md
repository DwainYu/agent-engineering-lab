---
id: 003-agent-loop
number: 3
title: Mini Agent Loop
status: planned
language:
  - python
concepts:
  - agent-loop
  - tool-calling
  - agent-runtime
day: 3
training_project:
  repo: tft-agent-set18
  path: app/agent/loop.py
---

# Experiment 003 — Mini Agent Loop

## Goal

Run multi-step tasks without LangGraph: transcript, tool registry, exit test,
budget.

## Architecture

_Planned._

```text
User → LLM → Tool → Tool Result → LLM → … → Answer
```

## What I Learned

_Not run yet — this file is the plan, and it becomes the record on Day 03._

## Next Step

Start with a task that needs two different tools, then add a third turn limit
and observe the failure.
