# Agent Engineering Lab

> Learn → Reproduce → Experiment → Build

A hands-on learning laboratory for understanding and building LLM Agents.

This repository documents the journey from understanding what an Agent loop
is, to designing Agent runtimes that hold up in production.

It is part of a three-repository system, and each part has one job:

```text
agent-engineering-lab      explain   ← you are here
        │  notes · concepts · experiments · progress
        ▼
tft-agent-set18            prove     minimal hand-written implementations
        │  validated ideas
        ▼
tft-agent-set17            ship      production Agent, portfolio project
```

Keeping those separate is the point: Set 17 never becomes a place to
"learn in public", and Set 18 never has to be feature-complete.

## Why

I don't want to simply "use" Agent frameworks. I want to understand:

- How Agent Loops work
- How Tool Calling works
- How State is managed
- How Context is constructed
- How Memory and Session work
- How RAG works
- How Agents are evaluated
- How Agent systems are deployed and observed

## Learning Method

Every unit follows the same loop:

```text
Learn → Read Source → Ask AI → Implement → Review → Document → Commit
```

Two rules keep it honest:

1. Every learning Day corresponds to at least one Git commit.
2. AI answers are raw material — a note only counts once I have rewritten the
   explanation myself, in `My Own Explanation`.

## Roadmap

| Phase | Topic                    |
| ----- | ------------------------ |
| 1     | Agent Fundamentals       |
| 2     | Agent Runtime            |
| 3     | Context                  |
| 4     | Memory                   |
| 5     | RAG                      |
| 6     | Evaluation               |
| 7     | Production               |
| 8     | Real Project (Set 18/17) |

Full list with checkboxes: [ROADMAP.md](./ROADMAP.md).

## Repository

```text
docs/
  daily/          one Markdown file per learning day
  concepts/       one file per durable knowledge node
  comparisons/    "which one, and why" — the architecture-decision notes
  architecture/   design docs for this system and for Agent runtimes
  questions/      open.md / resolved.md — what I do not understand yet
experiments/      experiment records: goal, code snippets, results
prompts/          the prompts used while learning
data/             site.json (config) + progress.json (generated)
scripts/          the content engine: parse → validate → generate
web/              React + Vite + Tailwind front-end
```

## The content engine

The repository _is_ the database.

```text
Markdown + frontmatter
   ↓ scripts/lib/load.ts        parse, type
   ↓ scripts/lib/validate.ts    cross-document rules
   ↓ scripts/lib/progress.ts    aggregate
   ↓
data/progress.json  +  web/src/data/generated/*.json
   ↓
React
```

Adding content never means touching React code:

| Want to…           | Do this                                  |
| ------------------ | ---------------------------------------- |
| add a learning day | create `docs/daily/day-04.md`            |
| add a concept      | create `docs/concepts/memory.md`         |
| add an experiment  | create `experiments/004-state/README.md` |
| ask a question     | append to `docs/questions/open.md`       |

Then:

```bash
npm run validate     # content errors, non-zero exit
npm run generate     # rebuild progress.json + generated data
npm run dev          # look at it
```

`npm run build` regenerates before bundling (`prebuild`), so the site can
never ship a stale progress number.

## Quality gates

```bash
npm run check    # validate + lint + test + build
```

CI runs the same thing on every push and pull request; `main` additionally
deploys the site to GitHub Pages.

## Live site

Deployed from `main` by GitHub Actions:
`https://<username>.github.io/agent-engineering-lab/`

## License

MIT
