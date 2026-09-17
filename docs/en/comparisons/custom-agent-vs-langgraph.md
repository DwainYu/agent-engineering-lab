---
id: custom-agent-vs-langgraph
title: Hand-Written Agent Loop vs LangGraph
language: en
revision: 1
date: "2026-09-10"
status: learning
summary: Where a hand-written loop stops being cheaper than a framework, measured by writing both.

concepts:
  - agent
  - agent-loop
  - tool-calling
  - agent-runtime

training_project:
  repo: tft-agent-set18
  path: agent/loop.py

production_project:
  repo: tft-agent-set17
  path: api/agent/graph.py
---

# Hand-Written Agent Loop vs LangGraph

_Started on Day 01. The rule for this page: only claims I have personally
reproduced, with a link to the code that proves it._

## The question

Set 17 already uses LangGraph. If I rewrite the Agent from scratch in
Set 18, do I end up with something worse — or with the understanding of why
LangGraph has the shape it has?

## What a loop costs without a framework

Measured on Day 01 in `tft-agent-set18`: the loop itself is 203 lines, the whole
runtime 683, and it needs no third-party package. A correct loop is tiny —
transcript, tool schemas, executor, exit test, budget. The complexity is not in
the loop. It appears the moment the loop has to survive:

- [ ] process restart, with the transcript still intact — checkpoints
- [ ] a human approving a tool call mid-run — interrupts
- [ ] parallel branches writing to the same state — reducers
- [ ] streaming tokens and tool events to one client — event protocol
- [~] recording what happened — `trace.py` writes one JSON line per event, so a
  bad run can be read back; replaying it cannot be done yet
- [ ] routing that is not a linear chain — graph edges

## Prediction

Those six bullets map almost exactly onto LangGraph's headline features
(checkpointing, human-in-the-loop, reducers, streaming, tracing, conditional
edges). The framework is a list of real problems, which is why adopting it is
the right call for the production project.

What I expect to keep hand-written forever: the loop itself and the tool
contract. They are small, and understanding them is the point.

## Evidence

- `experiments/003-agent-loop/` — four turns, three tools, nine messages: the loop
- `experiments/004-failure-modes/` — six stop reasons: the guards
- `experiments/005-context-trim/` — 40 history messages dropped to 18: the policy
- `tft-agent-set18/docs/architecture.md` — the same table from the code side

## Conclusion

_Not yet — this page gets its verdict once the Set 18 loop reaches the same
feature list as Set 17's graph._
