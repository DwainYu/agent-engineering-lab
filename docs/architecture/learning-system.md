---
id: learning-system
title: How This Learning System Works
category: architecture
status: completed
progress: 100
summary: The repository is the database. Markdown is the input, generated JSON is the output, React only renders.

prerequisites:
  - agent

related:
  - agent-runtime

experiments: []
---

# How This Learning System Works

## The rule

There is exactly one source of truth: **Markdown inside this repository**.
`data/progress.json` and everything the site renders are _derived_. If a
number on the website looks wrong, the fix is a Markdown file, never the
generator.

## Pipeline

```text
docs/daily/*.md          ┐
docs/concepts/*.md       │   frontmatter (YAML)
docs/comparisons/*.md    ├─▶ body (Markdown)
experiments/*/README.md  │
data/site.json           ┘
        ↓
scripts/lib/load.ts        walk + parse → typed entries + issues
scripts/lib/validate.ts    cross-document rules
scripts/lib/progress.ts    aggregation
        ↓
data/progress.json         committed, human readable
web/src/data/generated/    build product, git-ignored
        ↓
React (Vite)               renders, never computes
```

`npm run build` regenerates the derived data first (`prebuild` →
`npm run generate`), so a freshly cloned repository builds a complete site
with no stale JSON in git.

## Three projects, three jobs

```text
agent-engineering-lab → tft-agent-set18 → tft-agent-set17
     explain              prove             ship
```

- **Lab** (this repository) records and displays learning. Its
  `experiments/*/README.md` files hold _descriptions, code snippets and
  results_ — the code itself is not duplicated here.
- **Set 18** is the training ground: minimal, hand-written implementations,
  experiments runnable in `--mock` mode without an API key.
- **Set 17** is the product. Only ideas already proven in Set 18 land here.

Frontmatter carries that thread: every Day, Concept and Experiment may set
`training_project` and `production_project` with a `repo` and a `path`, and
the site renders both as links.

## Why the browser never parses Markdown

Two reasons, both practical:

1. Scanning files needs a filesystem; a GitHub Pages bundle has none.
2. Generation in Node means validation runs _before_ the site is built. A
   missing `phase` field fails CI instead of rendering a blank card.

## Adding content

| I want to…              | I touch…                                 | React code |
| ----------------------- | ---------------------------------------- | ---------- |
| add a learning day      | `docs/daily/day-04.md`                   | none       |
| add a concept           | `docs/concepts/context-engineering.md`   | none       |
| record an experiment    | `experiments/004-state/README.md`        | none       |
| add an architecture doc | `docs/architecture/<name>.md`            | none       |
| write a comparison      | `docs/comparisons/<slug>.md`             | none       |
| ask a question          | `docs/questions/open.md` → `resolved.md` | none       |
