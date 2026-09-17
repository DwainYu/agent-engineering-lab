---
id: day-02
day: 2
title: LLM API, Streaming And Usage
language: en
revision: 1
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
  path: agent/provider.py

difficulty: easy
estimated_time: 2h

commit_type: learning
---

# Day 02 — LLM API, Streaming And Usage

## Today's Goal

Write the LLM client myself: request, response, usage accounting, streaming
deltas, retry on 429 — so that `agent/provider.py` in Set 18 is code I understand
rather than code I borrowed.

## What I Learned

The scripted numbers had to stop being the evidence, so today the whole runtime
ran against a live endpoint: ModelScope API-Inference (魔搭社区) with
`Qwen/Qwen3.8-Flash-Next`, replacing the DeepSeek plan.

- The switch was one file. `agent/provider.py` now reads `MODELSCOPE_API_KEY` /
  `MODELSCOPE_BASE_URL` and sends an `extra_body` for endpoint-specific knobs
  (`enable_thinking: false`, `max_tokens: 1024`). The loop, the tools and the
  experiments did not change — which is the payoff of keeping transport out of
  `loop.py`.
- Usage became real, and it is mostly schemas: the same two messages cost 37
  prompt tokens without `tools` and 501 with four tool definitions
  (`experiments/001-basic-llm/`). Tool definitions outweigh dialogue.
- At `temperature: 0` the live model reproduced Experiment 002's trace four
  times in a row — same tool call, same 1 205 tokens, only the phrasing moved.
  That repeatability is what makes `ScriptedProvider` an honest stand-in.
- Experiment 005 stopped being tidy. With the same trimmed context, one run
  answered honestly that it could not confirm the figure, the next never
  converged and ended `stop_reason: max-turns` with an empty answer. Trimming
  does not only cost tokens, it removes the premise the model was reasoning
  from, and the budget is what makes that visible instead of silent.
- A real observability hole: `calls` lived on `ScriptedProvider`, so the live
  run printed "0 messages actually sent". Recording what was sent now belongs to
  the `Provider` interface, not to one implementation.
- Experiment 004 stays scripted on purpose. A failure catalogue has to
  reproduce; a live model instead invents failures nobody scripted — like
  probing four note keys the trim had just erased.

Streaming is still untouched: `provider.py` has no SSE path, and no 429 has
arrived, so backoff is still code I have read but not met.

## What I Didn't Understand

- How to reassemble a streamed tool call whose `arguments` arrive in
  fragments across SSE chunks.
- Why two other models on the same endpoint (`deepseek-ai/DeepSeek-V4-Flash-0731`,
  `meituan-longcat/LongCat-Flash-Lite`) replied to `say OK` with `content: null`
  while Qwen answered plainly. Not chased — the runtime needs one model that
  answers, and this one does.

## Experiment

Same five scripts, `--real`, against ModelScope:

```bash
export MODELSCOPE_API_KEY=***                     # ModelScope SDK token
python3 experiments/e01_single_turn.py --real
python3 experiments/e02_tool_calling.py --real    # four runs, same result
python3 experiments/e03_agent_loop.py --real
python3 experiments/e05_context_trim.py --real     # twice, twice differently
```

Real numbers are written into the notebooks, not replacing the scripted ones:

- `experiments/001-basic-llm/` — usage, and the schema cost measurement
- `experiments/002-tool-calling/` — one tool round trip on a live model
- `experiments/003-agent-loop/` — 8 scripted tokens vs 2 698 live ones
- `experiments/004-failure-modes/` — why this one stays scripted
- `experiments/005-context-trim/` — convergence is no longer guaranteed

## My Own Explanation

_Pending._

## Key Takeaways

_Pending._

## Next

Day 03 — Agent State: why the message list is not enough.
