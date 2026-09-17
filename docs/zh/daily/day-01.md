---
id: day-01
day: 1
title: Agent 到底是什么
date: "2026-09-10"
language: zh
source_revision: 1

status: completed
phase: fundamentals

topics:
  - agent
  - agent-loop
  - tool-calling

concepts:
  - agent
  - agent-loop
  - tool-calling
  - llm-api

experiment:
  - 001-basic-llm
  - 002-tool-calling
  - 003-agent-loop
  - 004-failure-modes
  - 005-context-trim

source:
  - https://www.anthropic.com/engineering/building-effective-agents

training_project:
  repo: tft-agent-set18
  path: agent/loop.py

production_project:
  repo: tft-agent-set17
  path: api/agent/graph.py

difficulty: easy
estimated_time: 3h

commit_type: learning
---

# Day 01 — Agent 到底是什么

## 今日目标

不用"自主"这个词，也能说清楚 Agent 是什么 —— 并且用一个"模型发出工具调用、最
终给出真实答案"的完整轮次来证明它。

## 今天学到了什么

**Workflow** 和 **Agent** 的差别只有一件事：控制流在谁手上。

```python
# Workflow：步骤是我写的。
def summarize_topic(topic: str) -> str:
    docs = retrieve(topic)          # 第 1 步
    return complete(prompt(docs))   # 第 2 步

# Agent：步骤由模型在运行时决定。
def agent(goal: str) -> str:
    messages = [{"role": "user", "content": goal}]
    while True:
        reply = complete(messages, tools=TOOLS)
        if not reply.tool_calls:
            return reply.content
        messages.append(as_message(reply))
        messages.append(tool_results(reply.tool_calls))
```

那个 `while True` 就是全部核心。本仓库后面的每一个主题 —— state、context、
memory、session、evaluation —— 之所以存在，都是因为这个循环在特定、可预测的地
方很脆弱。

现在我能把三件事分开：

1. **model** 只产出文本：一个回答，或者一次"请帮我调用工具"的请求。它自己不执行
   任何东西。
2. **runtime**（我的代码）执行工具、把结果追加进 transcript、决定是否进入下一轮。
3. 两者之间的 **contract** 是 message list 加上 tool schemas。这份 contract 是模
   型唯一"看得见"的东西。

Anthropic 的说法和这个一致：agent "通常只是循环里使用工具的 LLM"，而且他们的建
议是找最简单的方案 —— 只要任务的步骤能提前拆清楚，就应该优先用 Workflow 而不是
Agent。

## 源码分析

`experiments/002-tool-calling/` 是这个循环最小、最可观察的版本。一轮，没有
`while`。下面是脚本化 provider 的输出：

```text
 1. system     'You are an agent that finishes tasks step by step…'
 2. user       'What is (17 + 28) * 4? Use the calculator tool…'
 3. assistant  tool_calls=calculator({'expression': '(17 + 28) * 4'})   content=''
 4. tool       '180'
 5. assistant '(17 + 28) * 4 = 180.'
```

只有自己写过 client 才会注意到的两个 API contract 细节：

- 工具调用是一种 **finish reason**，不是一种 message 类型。runtime 靠
  `finish_reason: "tool_calls"` 才知道要继续，而不是停下来。
- 工具调用那一轮的文本是空的。如果 runtime 假设一定有文本、并且用"答案为空"来
  判断结束，那么工具还没执行，循环就先停了。

## 仍然不理解的问题

- 既然 message list 已经带上了全部信息，为什么还需要一个 **State** 对象。我的猜
  测是：循环还需要做一些"下一步跑哪个节点"的决策，而这些不是对话。Day 03 应该
  能回答。
- 怎么终止一个一直在调工具的循环。我现在只有 `max_turns`，那是个刹车片，不是解决
  方案。
  _（当天晚些时候由 Experiment 004 回答：要夹住的是请求的形状，而不只是轮数 ——
  对 `(tool, arguments)` 做重复检测，第三次相同的调用被拒绝，并把一条 observation
  交回给模型。）_

## 我向模型提出的问题

### 问题

> 如果 Workflow 也能做同样的事，那为什么还要有 Agent loop？

### 我学到的

因为 Workflow 需要"步骤数量"在写代码时就已经确定。只要某个任务的"需要几步"取决于
中间结果说了什么（这份文档回答了问题吗？我要不要再查一次？），它就没法被写成一条固定
的链 —— 这个分支必须从我的 `if` 挪进模型的输出里。

这个交换是明码标价的：用控制权换灵活性。这就是为什么 evaluation、budget、tracing
会出现在每一个生产级 Agent 设计里 —— 它们是拿来补回控制权的，不是装饰。

## 实验

原本计划是两个 notebook。实际发生的是：要跑这个计划，先得有个 runtime 可以跑，所以
`tft-agent-set18` 也在今天被写了出来：五个模块（`messages`、`provider`、`tools`、
`loop`、`context`、`trace`），五个实验，28 个 unittest 用例，只用标准库。

- `experiments/001-basic-llm/` — 一次模型调用，没有工具
- `experiments/002-tool-calling/` — 一次工具往返
- `experiments/003-agent-loop/` — 四轮，状态穿过工具往下传
- `experiments/004-failure-modes/` — 一次运行可能走坏的六种方式
- `experiments/005-context-trim/` — 历史变长之后模型到底收到了什么

代码：`tft-agent-set18/agent/` 和 `tft-agent-set18/experiments/`。

进来之前没有、离开时带走的两个答案：

- **终止一个卡住的循环**靠的不是 `max_turns`，而是对 `(tool, arguments)` 的重复检
  测 —— 第三次相同的调用被拒绝，并返回一条 observation，这让模型有机会在预算之内
  换个思路。
- **Context 才是真正的预算。** 四轮的运行结束时共有九条消息，每一轮都会重发全部
  消息；在 900 token 的上限下，runtime 把 40 条历史消息裁到 18 条，依然答对了 ——
  因为它需要的那个事实存在工具里，不在 prompt 里。

## 我的理解

Agent 就是包在一个文本模型外面、允许它开口求救的 `while` 循环。模型永远不亲自做
任何事，它只说它想让谁做什么。我作为工程师的活是：(a) 给它一小套诚实的工具，
(b) 永远把结果写回 transcript，(c) 决定循环什么时候结束 —— 因为这件事模型自己
判断不了。

## 踩过的坑

我一开始写工具 schema 时只写了 `name` 和 `description`，没有 `parameters`。于是模型
自己编了参数的 key。schema 合法不是锦上添花，它就是接口本身。

## 与 TFT Agent 的关联

在 Set 17 里对应的位置是 `api/agent/graph.py`。今天再读它，我能精确指出哪几行是
"那个循环"、哪几行只是 LangGraph 的脚手架 —— 以前在我眼里它就是一整块没差别的
代码。

## 复习要点

- Workflow 的步骤写在代码里；Agent 的步骤由模型写。
- 循环条件才是真正的产品决策。
- 一次工具调用 = 文本 + 一个 finish reason；执行永远是我自己的事。
- 简单才是目标：如果步骤已知，就不要造 Agent。
- 每一种失败都必须以文本形式返回；抛异常会丢掉整次运行，返回 observation 才是可
  恢复的。
- 需要长期保存的状态放在工具里，因为迟早会被裁剪出 prompt。

## 验证

现在我能解释：

- [x] 什么是 Agent Loop
- [x] 为什么工具会造出一个循环
- [x] 工具结果怎么回到模型
- [x] 循环什么时候终止
- [x] 卡住的循环是怎么被拒绝的（repeat guard，Experiment 004）
- [x] 裁剪的代价是什么，什么能活下来（Experiment 005）
- [ ] 为什么 State 要和 Message 分开（Day 03）

## 下一步

Day 02 — LLM API：streaming、usage，以及 client 的失败模式。那边的第一个动作：
对真实端点跑一遍 `e01..e05 --real`，让 token 统计不再只是一个脚本里的数字。
（2026-09-12 已对 ModelScope API-Inference 跑过；retry/backoff 那条路依然还没有
真正遇到过 429。）
