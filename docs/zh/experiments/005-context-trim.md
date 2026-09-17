---
id: 005-context-trim
title: Context 预算与裁剪
language: zh
source_revision: 1
summary: 让对话一直长下去，直到 runtime 必须决定忘掉什么，然后看任务还能不能完成。
---

# Experiment 005 — Context 预算与裁剪

## 目标

让对话一直长下去，直到 runtime 必须决定忘掉什么，然后看任务还能不能完成。

## 架构

```text
messages (grows every turn)
  ↓
estimate_tokens()  ≈ chars / 4 + 4 per message
  ↓
trim(budget)       keep system, drop oldest, always keep the current task
  ↓
provider.complete(request)      ← the model never sees what was dropped
```

## 学到了什么

- 裁剪对模型是不可见的。它只是拿到一份更短的 prompt，完全不知道有什么被删掉了 —— 而这
  正是"忘了指令"这类 bug 的出生地。
- system prompt 和当前任务是两件值得保护的东西；夹在中间的都可以商量。这个优先级是一个
  策略决策，不是关于 transformer 的事实。
- 只存在于 prompt 里的事实是临时的。`order_total` 之所以活下来了，是因为它存在工具里
  （`note_get`），不是因为模型记住了它。
- 字符数 ÷ 4 是个糟糕的 tokenizer，但它是个不错的预算信号。估算从不需要精确，只需要单
  调且便宜 —— 因为它驱动的那个决定只是"要不要砍掉一轮"。

## 结果

```text
$ python3 experiments/e05_context_trim.py
history       : 40 messages
full estimate : 2165 tokens (budget 900)
trimmed       : 18 messages, 881 tokens
trim events   : 2 of 2 turns had to drop context
request #1    : 17 messages actually sent
answer        : order_total is 100.0.
stop reason   : final-answer
```

过去的二十轮被丢掉了，任务依然完成。同样的脚本把预算降到 40 token 时只保留 system
prompt 加最后一轮 —— 运行仍然会回答，但此时"记忆"可证明地来自工具，而不是 context。

### 在真实端点上：同样的运行跑两次，两次都不一样

2026-09-12 跑在 ModelScope API-Inference（魔搭社区）上，模型
`Qwen/Qwen3.8-Flash-Next`，`enable_thinking: false`，`max_tokens: 1024`：

```text
$ python3 experiments/e05_context_trim.py --real   # 运行 A
answer        : I can retrieve the stored figure, but I can't confirm it.
                **What I found:** `order_total` = 100.0 …
stop reason   : final-answer
turns / tools / tokens : 4 / 6 / 5213
turn  3 note_get subtotal  → ERROR: no note stored under 'subtotal'
turn  3 note_get tax       → ERROR: no note stored under 'tax'
turn  3 note_get shipping  → ERROR: no note stored under 'shipping'
turn  3 note_get discount  → ERROR: no note stored under 'discount'

$ python3 experiments/e05_context_trim.py --real   # 运行 B，同样的输入
answer        : (empty)
stop reason   : max-turns
turns / tools / tokens : 4 / 4 / 4730
```

运行 A 读到了存下来的值，然后去翻四个已经被裁剪出它视野的 key，最后诚实地回答它无法
确认那个数字。运行 B 则完全没收敛：它一直在问，最后被轮数预算拦下，一个答案都没有。

脚本化的版本教不会我这一点。它总会回答，因为它的下一轮是写好的。换成真实模型之后，
裁剪 context 不只是丢了 token —— 它删掉了模型赖以前提的依据，而这次运行能不能扛过去，
是模型那天的行为属性，不是我的代码属性。预算能把"丢失的 context"变成一个看得见的
stop reason；但没有任何东西能把答案找回来。

## 代码

- `tft-agent-set18/agent/context.py` — `estimate_tokens`、`trim`
- `tft-agent-set18/agent/loop.py` — 每轮应用裁剪、`context_trimmed` 事件
- `tft-agent-set18/experiments/e05_context_trim.py`
- `tft-agent-set18/tests/test_context_trace.py` — 极端压力下 system prompt 与当前任务仍
  然存活

## 下一步

在真实端点上做 streaming 和 usage（Day 02），然后用一个"摘要式裁剪"取代"删除式裁剪"。
