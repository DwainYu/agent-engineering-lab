---
id: day-02
day: 2
title: LLM API、流式输出与用量统计
date: "2026-09-11"
language: zh
source_revision: 1

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
  path: agent/provider.py

difficulty: easy
estimated_time: 2h

commit_type: learning
---

# Day 02 — LLM API、流式输出与用量统计

## 今日目标

自己把 LLM client 写一遍：请求、响应、用量统计、流式 delta、429 重试 —— 让 Set 18
里的 `agent/provider.py` 变成我读得懂的代码，而不是借来的代码。

## 今天学到了什么

脚本里的数字不能再当证据用，所以今天整套 runtime 都跑在真实端点上：ModelScope
API-Inference（魔搭社区），模型 `Qwen/Qwen3.8-Flash-Next`，顶掉了原定的 DeepSeek
计划。

- 切换只动了一个文件。`agent/provider.py` 现在读 `MODELSCOPE_API_KEY` /
  `MODELSCOPE_BASE_URL`，并通过 `extra_body` 传端点特有的开关
  （`enable_thinking: false`、`max_tokens: 1024`）。loop、tools 和实验一行没改 ——
  这就是把传输层挡在 `loop.py` 之外的回报。
- 用量变成了真的，而且它主要是 schema 的账：同样的两条消息，不带 `tools` 是 37 个
  prompt token，带四个工具定义是 501 个（`experiments/001-basic-llm/`）。工具定义比
  对话更贵。
- 在 `temperature: 0` 下，真实模型连续四次复现了 Experiment 002 的轨迹 —— 同样的
  工具调用、同样的 1 205 token，只有措辞在变。这种可重复性才是
  `ScriptedProvider` 能当诚实替身的原因。
- Experiment 005 不再整齐。在同样被裁剪的 context 下，一次运行诚实地说它无法确认那
  个数字，下一次则完全没收敛，以 `stop_reason: max-turns` 加一个空答案收场。裁剪不只
  是掉了 token，它把模型赖以前提的那段推理依据删掉了；而预算的作用，是让这件事变得可
  见，而不是无声发生。
- 一个真实的可观测性漏洞：`calls` 挂在 `ScriptedProvider` 上，所以真实运行打印出
  "0 messages actually sent"。记录"到底发了什么"这件事，属于 `Provider` 接口，不属于
  某一个实现。
- Experiment 004 故意保持脚本化。失败目录必须是可复现的；而真实模型会自己发明一些没
  人写过的失败 —— 比如去探四个刚被裁剪掉的 note key。

Streaming 依然没碰：`provider.py` 没有 SSE 路径，也还没遇到 429，所以 backoff 目前仍
然是我读过、但没真正交手的代码。

## 仍然不理解的问题

- 一个被流式输出的工具调用，它的 `arguments` 分散在多个 SSE chunk 里到达时，怎么重新
  拼回去。
- 同一端点上另外两个模型（`deepseek-ai/DeepSeek-V4-Flash-0731`、
  `meituan-longcat/LongCat-Flash-Lite`）对 `say OK` 返回 `content: null`，而 Qwen 老老实
  实回答了。没有追 —— runtime 只需要一个会回答的模型，这个会。

## 实验

同样的五个脚本，加 `--real`，跑在 ModelScope 上：

```bash
export MODELSCOPE_API_KEY=***                     # ModelScope SDK token
python3 experiments/e01_single_turn.py --real
python3 experiments/e02_tool_calling.py --real    # 跑四次，结果相同
python3 experiments/e03_agent_loop.py --real
python3 experiments/e05_context_trim.py --real     # 跑两次，两次不同
```

真实数字写进了 notebook，不覆盖脚本里的数字：

- `experiments/001-basic-llm/` — 用量，以及 schema 成本测量
- `experiments/002-tool-calling/` — 真实模型上的一次工具往返
- `experiments/003-agent-loop/` — 脚本 8 个 token 对真实 2 698 个
- `experiments/004-failure-modes/` — 为什么这个保持脚本化
- `experiments/005-context-trim/` — 收敛不再有保证

## 我的理解

_待补充。_

## 复习要点

_待补充。_

## 下一步

Day 03 — Agent State：为什么只有 message list 还不够。
