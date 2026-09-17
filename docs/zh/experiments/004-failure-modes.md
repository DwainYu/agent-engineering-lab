---
id: 004-failure-modes
title: 故意制造失败模式
language: zh
source_revision: 1
summary: 用六种不同方式弄坏这个循环，确认每一种都以一个有名字的 stop reason 结束，而不是一个堆栈或一次无限运行。
---

# Experiment 004 — 故意制造失败模式

## 目标

用六种不同方式弄坏这个循环，确认每一种都以一个有名字的 stop reason 结束，而不是一个
堆栈或者一次无限运行。

## 架构

```text
call → registry.invoke
         ├─ ok        → observation
         ├─ ToolError → "ERROR: …"   as observation
         ├─ Exception → "ERROR: … raised RuntimeError: …"
         └─ repeated  → "REFUSED: identical call …"
run  → stop_reason ∈ final-answer | tool-budget | max-turns
                | provider-error | tool-error
```

## 学到了什么

- 模型犯的错是**数据**。缺参数、编造工具名、依赖崩了，全都以文本形式回来，运行继续往
  下走。唯一的设计问题是这些文本的信息量够不够让人恢复 —— "Error" 毫无价值，
  `calculator: missing argument(s) expression` 就不一样。
- 重复检测比轮数上限更重要。一个卡住的模型会把整个 `max_turns` 预算烧在相同的调用
  上，然后照样返回一个"看起来成功了"的结果；拒绝第三次相同的调用，才是给它一次换
  思路的机会。
- 预算要两个，不是一个：轮数约束的是对话长度，工具调用次数约束的是**单轮之内**的影响
  范围（一条 assistant 消息可以要六次调用）。
- `fail_on_tool_error` 是一个产品决策，不是技术决策：严格模式对流水线是对的，对探索性
  Agent 是错的。

## 结果

```text
$ python3 experiments/e04_failure_modes.py
1. invalid tool arguments      → ERROR: calculator: missing argument(s) expression
                                  recovery: "I need an expression to compute anything."
2. a tool that does not exist  → ERROR: unknown tool: web_search
                                  recovery: "That tool is unavailable…"
3. same call repeated          → REFUSED: identical call to now already made 2 times
4. no scripted turn left       → stop_reason: provider-error
5. more calls than allowed     → stop_reason: tool-budget   (tool_calls ≤ 2)
6. tool raises                 → ERROR: crash raised RuntimeError: database connection died

stop reasons:
  bad-arguments → final-answer    unknown-tool → final-answer
  stuck-loop    → final-answer    provider-error → provider-error
  tool-budget   → tool-budget     tool-crash   → final-answer
```

能恢复的那几个走到了 `final-answer`；两个结构性上限则带着原因停下了运行。这个区分就是
runtime 存在的全部意义。

### 为什么这个 notebook 保持脚本化

这里每一个 case 都是用 `ScriptedProvider` 构造的，即使在 `--real` 下也是。失败目录必须
可复现：如果注入的那一轮来自真实模型，那么这个 case 要么今天不发生，要么明天以另一种
方式发生，而那个用来固定 stop reason 的测试就变成了噪声。真实端点贡献的是这些失败的
*形状* —— key 缺失时的 `ProviderError`、三次带 backoff 重试之后的 HTTP 错误类、以及一轮
只带 `tool_calls` 而 `content` 为空的响应。

真实模型额外带来的是脚本编不出来的失败：去探并不存在的 key（Experiment 005 的真实运
行），这个过程在 trace 里看起来完全合理，却在白白烧轮数。

## 代码

- `agent/loop.py` — `_dispatch`、`repeat_limit`、`max_tool_calls`
- `agent/provider.py` — `ProviderError`、retry/backoff、脚本耗尽
- `experiments/e04_failure_modes.py`

## 下一步

Experiment 005：让历史一直长下去，直到 runtime 必须决定忘记什么。
