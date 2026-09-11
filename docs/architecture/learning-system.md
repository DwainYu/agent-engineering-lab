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

## Reading mode

The site is English-first. Most source material I read is English, the
identifiers in the code are English, and the point of the lab is to be able to
work in that language — so the English text is the content, and it is also the
record of how the learning actually happened.

Chinese exists as **reading assistance** for the concepts that are hard to read
quickly. It is written by hand, next to the paragraph it explains, and it is
explicitly not machine translation: no translated pages, no parallel content
tree, no i18n framework, no second source of truth.

| Piece                       | Where it lives                                                          |
| --------------------------- | ----------------------------------------------------------------------- |
| Which file has assistance   | `assist: { language: zh, mode: brief \| deep }` in the frontmatter      |
| The assistance text itself  | `> **中文理解**` / `> **中文深入理解**` blockquotes in the same file    |
| Agreement between the two   | `assistIssues()` in `scripts/lib/validate.ts`                           |
| Parsed value in the website | `assist` on the generated day / concept / experiment / comparison       |
| Recognition while rendering | `rehypeChineseAssist()` in `web/src/lib/markdown.ts`                    |
| The card                    | `web/src/components/learning/ChineseAssistBlock.tsx`                    |
| Reader's choice             | `EN` / `中文辅助` in `Header.tsx`, held in `lib/reading.ts`             |
| Persisted preference        | `localStorage` key `lab-reading-mode`, written by `ReadingModeProvider` |

Default is `EN`. In English mode an assistance block renders as nothing at all,
so an English-only visit looks exactly like a site without this feature. The
switch only appears on a page whose document actually declares `assist` — a
note with no Chinese never shows an empty toggle.

Excerpts and previews stay English-first: `excerpt()` drops whole assistance
blocks before summarising, so lists never fill up with Chinese.

To add assistance to a note, use the project skill:

```text
/skill:bilingual-learning        # brief: only the hard concepts
/skill:bilingual-learning deep   # plus deeper explanation where it pays
```

`mode: brief` and `mode: deep` describe how much depth a file asks for; a file
containing a deep block must declare `mode: deep`.
