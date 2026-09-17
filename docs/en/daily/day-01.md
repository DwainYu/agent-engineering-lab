---
id: day-01
day: 1
title: What An Agent Actually Is
language: en
revision: 1
date: "2026-09-10"
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

# Day 01 — What An Agent Actually Is

## Today's Goal

Be able to say what an Agent is without using the word "autonomous" — and
prove it by running one model turn that ends in a tool call and a real answer.

## What I Learned

The difference between a **Workflow** and an **Agent** is who holds the
control flow.

```python
# Workflow: I write the steps.
def summarize_topic(topic: str) -> str:
    docs = retrieve(topic)          # step 1
    return complete(prompt(docs))   # step 2

# Agent: the model writes the steps, at runtime.
def agent(goal: str) -> str:
    messages = [{"role": "user", "content": goal}]
    while True:
        reply = complete(messages, tools=TOOLS)
        if not reply.tool_calls:
            return reply.content
        messages.append(as_message(reply))
        messages.append(tool_results(reply.tool_calls))
```

That `while True` is the whole idea. Everything else in this repository —
state, context, memory, session, evaluation — exists because that loop is
fragile in specific, predictable ways.

Three things I can now separate:

1. **The model** only ever produces text: an answer, or a request to call a
   tool. It executes nothing.
2. **The runtime** (my code) executes tools, appends results to the
   transcript, and decides whether to run another turn.
3. **The contract** between them is the message list plus the tool schemas.
   That contract is the only thing the model "sees".

Anthropic's framing matches this: agents are "typically just LLMs using
tools in a loop", and the recommendation is to find the simplest solution —
workflows are preferred over agents wherever the task can be decomposed

ahead of time.

## Source Code Analysis

`experiments/002-tool-calling/` is the smallest observable version of the
loop. One turn, no `while`. Output from the scripted provider:

```text
 1. system     'You are an agent that finishes tasks step by step…'
 2. user       'What is (17 + 28) * 4? Use the calculator tool…'
 3. assistant  tool_calls=calculator({'expression': '(17 + 28) * 4'})   content=''
 4. tool       '180'
 5. assistant '(17 + 28) * 4 = 180.'
```

Two details about the API contract that only matter when you write the client
yourself:

- A tool call is a **finish reason**, not a message type. `finish_reason:
"tool_calls"` is how the runtime knows to continue instead of stopping.
- Text is empty on a tool-call turn. A runtime that assumes text and branches
  on "empty answer" ends the loop before the tool ever runs.

## What I Didn't Understand

- Why a **State** object is needed when the message list already carries
  everything. My guess: because the loop needs decisions (which node runs
  next) that are not conversation. Day 03 should answer this.
- How to stop a loop that keeps calling tools. I currently only have
  `max_turns`, which is a clamp, not a solution.
  _(Answered later the same day by Experiment 004: clamp the shape of the
  request, not just the number of turns — a repeat guard on
  `(tool, arguments)` refuses the third identical call and hands the model an
  observation it can act on.)_

## Questions Asked to the Model

### Question

> If a Workflow can do the same thing, why does the Agent loop exist at all?

### What I Learned

Because a Workflow needs the step count known at write-time. Any task where
"how many steps" depends on what the intermediate results say (does this
document answer the question, do I need to look again?) cannot be written as
a fixed chain — the branch has to move from my `if` into the model's output.

The trade is explicit: flexibility is bought with control. That is why
evaluation, budgets and tracing show up in every production Agent design —
they are the compensating controls, not decoration.

## Experiment

The plan was two notebooks. What actually happened is that the plan needed a
runtime to run against, so `tft-agent-set18` got written today as well: five
modules (`messages`, `provider`, `tools`, `loop`, `context`, `trace`), five
experiments, 28 unittest cases, standard library only.

- `experiments/001-basic-llm/` — one model turn, no tools
- `experiments/002-tool-calling/` — one tool round trip
- `experiments/003-agent-loop/` — four turns carrying state through tools
- `experiments/004-failure-modes/` — six ways a run ends badly
- `experiments/005-context-trim/` — what the model receives when history grows

Code: `tft-agent-set18/agent/` and `tft-agent-set18/experiments/`.

Two answers I came in without and left with:

- **Stopping a stuck loop** is not `max_turns`. It is a repeat guard on
  `(tool, arguments)` — the third identical call is refused with an
  observation, which gives the model a chance to change approach _inside_ the
  budget.
- **Context is the real budget.** The four-turn run ended with nine messages,
  each turn re-sending all of them; at a 900-token cap the runtime dropped 40
  history messages down to 18 and still answered correctly, because the fact it
  needed lived in a tool, not in the prompt.

## My Own Explanation

An Agent is a `while` loop around a text model that is allowed to ask for
help. The model never does anything; it only says what it wants done. My job
as the engineer is to (a) give it a small, honest set of tools, (b) always
give the result back in the transcript, and (c) decide when the loop is
over — because the model will not reliably decide that for me.

## Mistakes / Problems

I first wrote the tool schema with only `name` and `description`, no
`parameters`. The model then invented argument keys. Schema validity is not
a nicety — it is the interface.

## Connection to TFT Agent

In Set 17 the equivalent is `api/agent/graph.py`. Reading it today I can
point at the exact lines that are "the loop" and the lines that are LangGraph
machinery — previously it was one undifferentiated block to me.

## Key Takeaways

- Workflows are code-written steps; Agents are model-written steps.
- The loop condition is the real product decision.
- A tool call is text plus a finish reason; execution is always mine.
- Simplicity is the goal: if the steps are known, do not build an Agent.
- Every failure mode has to return as text; an exception loses the run, an
  observation keeps it recoverable.
- Durable state belongs in tools, because trimming will delete it from the
  prompt eventually.

## Verification

I can now explain:

- [x] What an Agent Loop is
- [x] Why tools create a loop
- [x] How tool results return to the model
- [x] When the loop terminates
- [x] How a stuck loop is refused (repeat guard, Experiment 004)
- [x] What trimming costs, and what survives it (Experiment 005)
- [ ] Why State is separate from Message (Day 03)

## Next

Day 02 — LLM API: streaming, usage and the failure modes of the client. First
action there: run `e01..e05 --real` against a live endpoint, so token accounting
stops being a scripted number. (Done on 2026-09-12 against ModelScope
API-Inference; the retry/backoff path still has not met a real 429.)
