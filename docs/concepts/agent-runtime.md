---
id: agent-runtime
title: Agent Runtime
category: runtime
status: planned
progress: 0
summary: "Everything that is not the model: state, message history, event stream, budgets, and the scheduling of tool execution."

prerequisites:
  - agent-loop

related:
  - agent-loop

experiments: []

training_project:
  repo: tft-agent-set18
  path: agent/
---

# Agent Runtime

## Definition

The **Agent Runtime** is the host process around the model: it owns state,
the message transcript, event emission, budgets and tool scheduling.

## Why

The loop is easy; running it many times, on many concurrent users, without
losing or duplicating state, is the hard part. That is where frameworks earn
their keep — and where I need to know what they are doing for me.

## Minimal Implementation

To be filled in on Day 03 / Day 04, when `app/agent/state.py` and
`app/agent/events.py` exist.

## Real Project

- Training: `tft-agent-set18/app/agent/`
- Production: `tft-agent-set17/api/agent/`

## Common Problems

_Open questions I expect to hit:_

- Where does the transcript live if the process restarts?
- What is the difference between state and session?
- Which parts of LangGraph replace code I would otherwise write myself?
