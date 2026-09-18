# Learning Roadmap

A schedule I actually run, not a list of nouns. Phase 1 is in progress.

Rules:

- A phase closes when its concepts reach `status: completed` **and** the
  experiment ran.
- `agent` (Day 01) is the only content written before the loop started, so
  nothing here is a claim about work already finished.

## Phase 1 — Agent Fundamentals

- [x] Agent Architecture
  - English: `docs/en/daily/day-01.md`
  - 中文: `docs/zh/daily/day-01.md`
- [ ] LLM API
- [ ] Tool Calling
- [ ] Agent Loop

Exit criteria: an Agent that runs one multi-step task from scratch, standard
library only, no framework.

## Phase 2 — Agent Runtime

- [ ] State
- [ ] Node
- [ ] Graph
- [ ] Message
- [ ] Event

Exit criteria: the loop from Phase 1 restarts mid-run without losing state.

## Phase 3 — Context

- [ ] Context Construction
- [ ] Context Window
- [ ] Context Compression
- [ ] Prompt Management

Exit criteria: a 100-turn transcript fits a fixed token budget and still
answers a question asked on turn 3.

## Phase 4 — Memory

- [ ] Session
- [ ] Checkpoint
- [ ] Short-term Memory
- [ ] Long-term Memory

Exit criteria: two concurrent users share one process without leaking each
other's history.

## Phase 5 — RAG

- [ ] Embedding
- [ ] Vector Retrieval
- [ ] Reranking
- [ ] Knowledge Graph

Exit criteria: retrieval quality measured on a dataset I wrote, not on vibes.

## Phase 6 — Evaluation

- [ ] Dataset
- [ ] Golden Answers
- [ ] Agent Evaluation
- [ ] Tool Success Rate
- [ ] Latency
- [ ] Cost

Exit criteria: a change to the prompt moves a number, and I can say by how
much it should.

## Phase 7 — Production

- [ ] Streaming
- [ ] Authentication
- [ ] Retry
- [ ] Timeout
- [ ] Observability
- [ ] Deployment

Exit criteria: I can explain any past run from its trace alone.

## Phase 8 — Real Project

- [ ] Apply concepts to `tft-agent-set18` (training ground)
- [ ] Refactor its Agent Runtime
- [ ] Port proven pieces into `tft-agent-set17`
- [ ] Add evaluation to Set 17
- [ ] Add observability to Set 17

## Current

```text
Day 1   completed   Agent Architecture
Day 2   learning    LLM API, Streaming And Usage
Day 3   planned     Agent State And Termination
```

Next up: `experiments/002-tool-calling/` → `experiments/003-agent-loop/`,
then answering Q001 (why State is not the transcript).
