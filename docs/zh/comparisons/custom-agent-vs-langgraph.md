---
id: custom-agent-vs-langgraph
title: 手写 Agent Loop 与 LangGraph 的对比
date: "2026-09-10"
status: learning
language: zh
source_revision: 1
summary: 手写循环从什么时候开始不再比框架划算 —— 用两个都写一遍的方式测量。

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

# 手写 Agent Loop 与 LangGraph 的对比

_Day 01 开始。本页的规矩：只写我亲自复现过的结论，并且附上能证明它的代码。_

## 问题是什么

Set 17 已经在用 LangGraph。如果我在 Set 18 里从零重写一遍 Agent，最后得到的是更差的
东西，还是"为什么 LangGraph 长成那个样子"的理解？

## 没有框架时，一个循环要付什么

Day 01 在 `tft-agent-set18` 里实测：循环本身 203 行，整个 runtime 683 行，不需要任何第
三方包。一个正确的循环很小 —— transcript、tool schemas、executor、exit test、budget。
复杂度根本不在循环里。它出现在循环必须活过下面这些情况的时候：

- [ ] 进程重启，transcript 还得在 —— checkpoint
- [ ] 运行中有人要审批一次工具调用 —— interrupt
- [ ] 并行分支写同一个 state —— reducer
- [ ] 把 token 和工具事件流式推给同一个客户端 —— event protocol
- [~] 记录发生了什么 —— `trace.py` 每个事件写一行 JSON，所以坏掉的运行可以回放着
      读；但重放（replay）还做不到
- [ ] 不是线性链的路由 —— graph edge

## 预测

上面六条几乎正好对应 LangGraph 的主打特性（checkpointing、human-in-the-loop、
reducers、streaming、tracing、conditional edges）。框架本身就是一张真实问题的清单，
这也正是生产项目采用它的理由。

我预期会永远手写下去的只有两样：循环本体，和工具 contract。它们很小，而理解它们正是
目的本身。

## 证据

- `experiments/003-agent-loop/` — 四轮、三个工具、九条消息：循环
- `experiments/004-failure-modes/` — 六种 stop reason：护栏
- `experiments/005-context-trim/` — 40 条历史消息裁到 18 条：策略
- `tft-agent-set18/docs/architecture.md` — 同一张表的代码侧版本

## 结论

_还没有 —— 等 Set 18 的循环达到 Set 17 那张图的特性清单时，本页才下判决。_
