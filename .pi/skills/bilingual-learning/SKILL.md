---
name: bilingual-learning
description: Add concise Chinese reading assistance to an English-first learning note in this repository. Invoke with /skill:bilingual-learning or /skill:bilingual-learning deep. Never use it to translate the site.
---

# Bilingual Learning (English-first, Chinese-assisted)

English is the primary content of this repository and the language the real
learning process is written in. Chinese exists only to help reading of hard
concepts. A Chinese block is always supplementary — never a replacement for the
English text it follows.

## Modes

`/skill:bilingual-learning` accepts an optional mode argument:

| Mode        | When to use                                                     | What you produce                                                 |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `brief`     | Default. The reader already reads English; hard spots hurt.     | Chinese only for the genuinely difficult concepts                |
| `deep`      | Explicitly requested, or the concept is architecture-level hard | Brief version plus a deeper Chinese explanation of the mechanics |
| `translate` | Only when the user explicitly asks for a translation pass       | Hand off to the separate translation task described at the end   |

## Hard rules

1. Never rewrite, delete or shorten the existing English text. Chinese is
   inserted as new blocks only.
2. Never translate code. No Chinese inside code fences, and never turn code
   identifiers, file paths, config keys, commands or API fields into Chinese.
3. Keep these terms in English wherever they appear in a Chinese sentence:
   `Agent`, `Agent Loop`, `Tool Calling`, `Context`, `Context Engineering`,
   `Memory`, `State`, `Checkpoint`, `Streaming`, `Provider`, `Embedding`,
   `RAG`, `FastAPI`, `LangGraph`. Do not invent Chinese replacements.
4. Do not force Chinese into obvious content ("Open the repository", "run this
   command", plain field lists). Skip sections that carry no conceptual load.
5. Each block must be genuinely shorter than the English it assists, and must
   not repeat content already visible on screen.
6. Write in a technical, direct tone, consistent with the existing notes.
7. Do not fabricate learning results. A Chinese block may restate what the
   English says; it may not add claims, numbers or outcomes the English does
   not have.

## Format

Put the block immediately after the English paragraph, list or section it
explains, inside the same `##` section. Blank `>` lines separate the marker from
the body.

```markdown
> **中文理解**
>
> Agent Loop 可以理解为：模型决策 → 调用工具 → 获得结果 → 再次决策。
> 停止条件有两个：模型给出最终答案，或者 runtime 的预算耗尽。
```

Deep mode only:

```markdown
> **中文深入理解**
>
> Checkpoint 解决的是可恢复性，不是 Memory。
> 它保存某一时刻的 State，让运行可以 replay 或 resume。
```

The content parser recognises exactly two markers — `> **中文理解**` and
`> **中文深入理解**` — and a marker must sit alone on its line.

## Frontmatter

Every file that gains a Chinese block must declare:

```yaml
assist:
  language: zh
  mode: brief
```

Use `mode: deep` when the file contains a `中文深入理解` block. `validate`
rejects `assist` without a matching block, a block without `assist`, any other
language, and any mode other than `brief` / `deep`.

## Procedure

1. Read the target file. Decide which passages are conceptually hard enough to
   deserve assistance; aim for one block per section at most.
2. Insert the blocks and the `assist` frontmatter. Touch no other line.
3. `npm run validate` — fix content errors before anything else.
4. `npm run generate` — writes `assist` into the generated JSON the site reads.
5. `npm test` — parsing, validation, rendering and toggle behaviour.
6. Suggest the commit, following the conventions in `AGENTS.md`:
   `dayXX: <topic>` for a day note, `web: <topic>` for a concept, experiment
   notebook or comparison.

Run the quality gates yourself if you are asked to finish the change; never
claim they pass without seeing the output.

## Not a translation system

This skill never produces full-page Chinese content. If the user explicitly
asks for a translation pass (`translate`), the deliverable is a separate
proposed task with its own file layout — do not silently add translated pages,
do not change routes, and do not mix a full translation into a note that this
skill is meant to assist.
