---
id: agent-runtime
title: Agent Runtime
category: runtime
status: planned
progress: 0
language: zh
source_revision: 1
summary: "除了模型以外的一切：state、message history、event stream、预算，以及工具执行的调度。"

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

## 定义

**Agent Runtime** 是模型外面那层宿主进程：它拥有 state、message transcript、事件发
射、预算以及工具调度。

## 为什么重要

循环本身很简单；难的是把它跑很多次、跑在很多并发用户上，同时不丢状态、不重复状态。
框架真正的价值在这里 —— 也正是我需要知道"它们替我做了什么"的地方。

## 最小实现

等 Day 03 / Day 04 填，那时候 `agent/state.py` 和 `agent/events.py` 才会存在。

## 真实项目里

- Training：`tft-agent-set18/agent/` — `loop.py` 管轮次，`trace.py` 管事件。
- Production：`tft-agent-set17/api/agent/`

## 常见问题

_我预期会撞上的开放问题：_

- 如果进程重启，transcript 存在哪里？
- state 和 session 的区别是什么？
- LangGraph 的哪些部分，替代了本该我自己写的代码？
