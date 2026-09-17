---
id: learning-system
title: How This Learning System Works
date: 2026-09-17
language: en
revision: 1
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
docs/en/daily/*.md        ┐
docs/en/concepts/*.md     │
docs/zh/daily/*.md        │   frontmatter (YAML)
docs/zh/concepts/*.md     ├─▶ body (Markdown)
docs/{en,zh}/questions/   │
experiments/*/README.md   │
data/site.json            ┘
        ↓
scripts/lib/load.ts         walk + parse → typed entries + issues
scripts/lib/validate.ts     cross-document rules
scripts/lib/translation.ts  language matching → synced / outdated / missing
scripts/lib/progress.ts     aggregation
        ↓
data/progress.json         committed, human readable
web/src/data/generated/    build product
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

1. Scanning files needs a filesystem; GitHub Pages bundle has none.
2. Generation in Node means validation runs _before_ the site is built. A
   missing `phase` field fails CI instead of rendering a blank card.

## Bilingual documents

English and Chinese each own a complete Markdown tree:

```text
docs/en/     canonical technical source
docs/zh/     complete Chinese learning / review version
```

Chinese is **not** sentence-by-sentence machine translation, and it is not an
assistance card tucked under an English paragraph. It is a standalone Chinese
document you can review from — restructuring sentences for learning purposes is
allowed, while technical facts, API names, class names, function names, file
names, code and experiment results never move.

The pairing runs on a **stable id**, never on the file name:

```yaml
# docs/en/concepts/agent-loop.md
id: agent-loop
language: en
revision: 1
```

```yaml
# docs/zh/concepts/agent-loop.md
id: agent-loop
language: zh
source_revision: 1
```

The content engine compares the two numbers and derives the translation state:

| Comparison                          | Status      |
| ----------------------------------- | ----------- |
| `source_revision == revision`       | `synced`    |
| `source_revision != revision`       | `outdated`  |
| English exists, Chinese does not    | `missing`   |

The state is written to `web/src/data/generated/sync.json`, and the Progress page
shows `English Days`, `Chinese Days` and `Translation Sync`.

> The `assist:` frontmatter key and the `> **中文理解**` blockquotes belonged to the
> previous architecture. Everything they carried now lives in `docs/zh/`, and no
> code reads them any more.

## Routes and the language switch

```text
/en/learn/day/1     /zh/learn/day/1
/en/concepts/...    /zh/concepts/...
```

`EN | 中文` in the header **navigates** to the same document id under the other
language — it does not flip a local UI flag. The URL is the final source of
truth; `localStorage` only remembers the preference (key `agent-lab-language`,
default `en`). Legacy links without a language prefix (`/learn/day/1`) redirect
to `/en/learn/day/1` instead of 404ing.

## Glossary

`docs/glossary.yml` holds the protected technical terms and their Chinese
renderings. English terms stay English; the first occurrence may carry a gloss
(`Context Engineering（上下文工程）`) and no Chinese replacement is invented
afterwards.

## Adding content

| I want to…                  | I touch…                                     | React code |
| --------------------------- | -------------------------------------------- | ---------- |
| add a learning day           | `docs/en/daily/day-04.md`                    | none       |
| add its Chinese version      | `docs/zh/daily/day-04.md`                    | none       |
| add a concept                | `docs/en/concepts/context-engineering.md`    | none       |
| record an experiment         | `experiments/004-state/README.md`            | none       |
| add an architecture doc      | `docs/en/architecture/<name>.md`             | none       |
| write a comparison           | `docs/en/comparisons/<slug>.md`              | none       |
| ask a question               | `docs/en/questions/open.md` → `resolved.md`  | none       |

## Filling in the Chinese side

Use the project skill:

```text
/skill:bilingual-learning        # ordinary notes: tighter Chinese, still complete
/skill:bilingual-learning deep   # harder concepts: fuller mechanics, 补充理解
/skill:bilingual-learning review # read-only drift check
```
