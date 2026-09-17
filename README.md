# Agent Engineering Lab

> Learn → Reproduce → Experiment → Build

[English](README.md) · [中文](README.zh-CN.md)

![CI](https://github.com/DwainYu/agent-engineering-lab/actions/workflows/ci.yml/badge.svg)

A hands-on learning laboratory for Agent Engineering. It combines daily
learning notes, durable concept documents, experiment notebooks, architecture
comparisons, open questions and a bilingual (English / Chinese) knowledge base —
all published as a GitHub Pages site generated from this repository itself.

This is a learning repository, not a blog: every note carries a date, a source
and a `status`; every claim about how an Agent works is tied to an experiment
notebook or to code in the training repository; and the numbers on the site are
derived from the Markdown rather than written by hand.

Live site: <https://dwainyu.github.io/agent-engineering-lab/>

## Why

The goal is not to "use" Agent frameworks, but to understand:

- How an Agent Loop works
- How Tool Calling works
- How state is managed
- How context is constructed
- How Memory and Session work
- How RAG works
- How Agents are evaluated
- How Agent systems are deployed and observed

## Repository Architecture

Three repositories, each with one job:

```text
agent-engineering-lab      explain   ← you are here
        │  knowledge base · experiment docs · progress · learning site
        ▼
tft-agent-set18            prove     minimal hand-written implementations
        │  validated ideas
        ▼
tft-agent-set17            ship      production-oriented Agent project
        │
        ▼
Production / Portfolio
```

| Repository                                                                  | Role                                                     |
| --------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`agent-engineering-lab`](https://github.com/DwainYu/agent-engineering-lab) | knowledge base, experiment docs, progress, learning site |
| [`tft-agent-set18`](https://github.com/DwainYu/tft-agent-set18)             | runnable Agent Engineering training ground               |
| [`tft-agent-set17`](https://github.com/DwainYu/tft-agent-set17)             | production-oriented Agent project / portfolio            |

Set 18 is a training ground — minimal, hand-written implementations, not a
production system. Set 17 is the production-oriented project — not a place to
learn in public. Keeping them apart is the point.

## Learning Method

Every unit follows the same loop:

```text
Learn → Read Source → Ask AI → Implement → Review → Document → Commit
```

Two rules keep it honest:

1. Every learning Day corresponds to at least one Git commit.
2. AI-generated answers are raw material. A concept only becomes part of the
   learning record after the learner verifies it, implements it, and writes the
   explanation themselves — under `## My Own Explanation` in the Day note.

## Bilingual Knowledge Base

The lab maintains two complete documentation trees:

```text
docs/en/    canonical technical source
docs/zh/    complete Chinese learning / review version
```

English is the canonical source of technical facts. Every Chinese document is a
complete learning document of its own, with its own route and its own URL — not
a hidden translation overlay, not an assist card folded under an English
paragraph, not a sentence-by-sentence machine translation. Readers review
straight from it.

Pairing runs on a stable `id`, never on file names:

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

English owns `revision`; a translation declares the `source_revision` it was
produced from. The content engine compares the two and derives the state of
every document:

| Rule                            | Status     |
| ------------------------------- | ---------- |
| Chinese document does not exist | `missing`  |
| `source_revision == revision`   | `synced`   |
| `source_revision != revision`   | `outdated` |

The per-document state is written to `web/src/data/generated/sync.json`, and
`npm run validate` prints the `synced` / `outdated` / `missing` totals for the
whole knowledge base.

`docs/glossary.yml` is the terminology contract: identifiers, API names, class
names, function names, file names and code are never translated, and a Chinese
gloss may appear on first mention only.

The pair is maintained with a project-local Pi skill at
`.pi/skills/bilingual-learning/SKILL.md`, which turns an English note into a
complete Chinese learning document and can check the two for drift.

## Language Switching

The site provides two complete documentation views — English and 中文 — under
language-prefixed routes:

```text
https://dwainyu.github.io/agent-engineering-lab/en/
https://dwainyu.github.io/agent-engineering-lab/zh/
```

English is the default language. The `EN | 中文` switch in the header
**navigates** to the same document id in the other language
(`/en/learn/day/1` → `/zh/learn/day/1`); it does not flip a local UI flag. The
URL decides the language, and `localStorage` only remembers the preference for
unprefixed links.

When a document has no counterpart yet, the page says so and links to the
version that does exist — the site never invents a translation.

## Experiments And Code

There is only one copy of experiment code, and it lives in the training
repository. The lab stores the documentation:

```text
tft-agent-set18
  experiments/005-context-trim/            ← the code, exactly one copy

agent-engineering-lab
  experiments/005-context-trim/README.md   ← English lab notebook (id, revision)
  docs/zh/experiments/005-context-trim.md  ← Chinese counterpart (source_revision)
```

English notebooks live beside their experiment directory as `README.md`; the
Chinese review version lives in the `zh` tree. Both are keyed to the same
experiment `id`, and the validator fails an experiment document that has no
matching experiment directory. Day and concept notes link into Set 18 with
`training_project`, and into Set 17 with `production_project`.

## Roadmap

| Phase | Topic              |
| ----- | ------------------ |
| 1     | Agent Fundamentals |
| 2     | Agent Runtime      |
| 3     | Context            |
| 4     | Memory             |
| 5     | RAG                |
| 6     | Evaluation         |
| 7     | Production         |
| 8     | Real Projects      |

Full checklist with exit criteria: [ROADMAP.md](ROADMAP.md).

## Documentation Structure

```text
docs/
├── en/                 canonical technical source
│   ├── daily/          one learning record per day
│   ├── concepts/       durable knowledge nodes
│   ├── comparisons/    architecture and technology decisions
│   ├── architecture/   design docs for the learning system and Agent runtimes
│   └── questions/      open.md / resolved.md — what is not understood yet
└── zh/                 complete Chinese learning version
    ├── daily/
    ├── concepts/
    ├── experiments/    Chinese review docs for experiments/*/README.md
    ├── comparisons/
    ├── architecture/
    └── questions/

docs/glossary.yml       terminology contract for both trees
experiments/            English lab notebooks — one dir per experiment, docs only
prompts/                the prompts used while learning
data/                   site.json (config) · progress.json (generated)
scripts/                the content engine: load → validate → generate
web/                    React + Vite + Tailwind front-end
tests/                  content, language and page tests
```

The same engine reads both trees under the same rules, so a Chinese document
that is missing or behind its English source is reported, not hidden.

## Content Engine

The repository itself is the source data. The website is generated from
Markdown and frontmatter — the browser never parses Markdown:

```text
Markdown + frontmatter
        ↓  scripts/lib/load.ts        walk docs/{en,zh} + experiments, parse, type
        ↓  scripts/lib/validate.ts    cross-document and pairing rules
        ↓  scripts/lib/translation.ts synced / outdated / missing
        ↓  scripts/lib/progress.ts    aggregation
        ↓
JSON   data/progress.json · web/src/data/generated/*.json
        ↓
React  renders, never computes
        ↓
GitHub Pages
```

`data/progress.json` and `web/src/data/generated/` are committed, and CI
regenerates them and fails if the result differs — so the site can never ship a
stale number.

## Adding Content

| Add                    | Files                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- |
| a learning day         | `docs/en/daily/day-XX.md` and `docs/zh/daily/day-XX.md`                      |
| a concept              | `docs/en/concepts/example.md` and `docs/zh/concepts/example.md`              |
| an experiment document | `experiments/006-example/README.md` and `docs/zh/experiments/006-example.md` |
| a comparison           | `docs/en/comparisons/example.md` and `docs/zh/comparisons/example.md`        |
| an architecture note   | `docs/en/architecture/example.md` and `docs/zh/architecture/example.md`      |
| a question             | `docs/en/questions/open.md`, moved to `resolved.md` once answered            |

Then `npm run validate`. The rules the validator enforces:

- `id` is the pair key; `language` must match the tree the file sits in.
- A file name must match its `id` (`concept` / `comparison`), or its `day`
  number (`day-07.md` ⇔ `day: 7`).
- A Chinese document requires an English document with the same `id`, and must
  declare `source_revision`.
- A Day at `status: completed` requires the full set of Day sections — English
  and Chinese each have their own required headings.

If the Chinese version is not ready, leave the file out: the engine records it
as `missing`. Never invent content to close a gap.

Adding content never means touching React code.

## Development

```bash
npm install     # Node >= 22.12
npm run dev     # http://localhost:5173/  (hot reload, base path /)

npm run build   # regenerate derived data, typecheck, bundle to dist/
npm run preview # http://localhost:4173/
```

Generated data is committed, so a fresh clone runs `npm run dev` immediately.
After editing content, regenerate before committing:

```bash
npm run generate
```

## Live Site

| Entry   | URL                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| English | <https://dwainyu.github.io/agent-engineering-lab/en/>                                                         |
| 中文    | <https://dwainyu.github.io/agent-engineering-lab/zh/>                                                         |
| Root    | <https://dwainyu.github.io/agent-engineering-lab/> (redirects to the remembered language, English by default) |

Sections: `/learn` (daily notes), `/concepts`, `/experiments`, `/comparisons`,
`/projects`, `/progress`, `/about` — each under its own language prefix. The
Progress page tracks days, concepts, experiments, comparisons and open
questions in the language you are reading; bilingual coverage is reported by
`npm run validate` rather than by the page. Deep links work because the build
ships `404.html` as the same SPA bundle.

## Quality Gates

```bash
npm run validate    # frontmatter, cross-document rules, bilingual pairing
npm run lint        # eslint
npm run typecheck   # app, scripts and tests
npm test            # vitest
npm run check       # validate + lint + typecheck + test
```

CI (`.github/workflows/ci.yml`) runs validation, linting, typechecking, tests
and the build on every push to `main` and on every pull request, and additionally
asserts that the generated data is committed and fresh.
`.github/workflows/deploy.yml` publishes `main` to GitHub Pages:

```text
main → GitHub Actions → GitHub Pages
```

## Learning Philosophy

Every concept note answers the same questions in the same order:

1. `Definition` — what it is
2. `Why` — why it exists
3. `Minimal Implementation` — the smallest version that actually runs
4. `Real Project` — where it shows up in Set 18 and Set 17
5. `Common Problems` — what breaks in production

## License

MIT
