---
name: bilingual-learning
description: >-
  Convert and maintain complete English / Chinese learning documents for Agent
  Engineering Lab while preserving technical accuracy and stable document
  identity. Use when the user runs /skill:bilingual-learning (optionally brief,
  deep, review or translate) to create or update the Chinese version of an
  English note, or /skill:bilingual-learning review to check English/Chinese
  drift. English stays canonical; the Chinese file is a full learning document,
  not an assist card and not a sentence-by-sentence translation.
---

# Bilingual Learning (English source → complete Chinese document)

This skill sits at the end of a learning loop:

```text
学习 → 理解 → 整理 → 双语知识沉淀
```

It produces a **complete Chinese learning document** for an English one. It is
not a generic translator, not a helper block generator, and not a site
translation pipeline.

## Source of truth

```text
English = canonical technical source
Chinese = derived learning document
```

- Never edit, shorten or re-order English text in order to make Chinese match.
- Never propagate a Chinese edit back into English. If the user says the
  Chinese reads wrong and the English source may be the problem: flag it in the
  output, remind the user to check the English file, and change nothing there.
- The single authorized edit to an English file is the one-time removal of
  legacy assist blocks (§ Legacy assist blocks), and only when the user asks
  for that migration.

## File mapping

Mirror the English path under `docs/zh/`, dropping the `en/` segment when the
repository uses one. Same filename, same stable `id`, same document category.

| English                                            | Chinese                                            |
| -------------------------------------------------- | -------------------------------------------------- |
| `docs/en/daily/day-06.md`                          | `docs/zh/daily/day-06.md`                          |
| `docs/en/concepts/agent-loop.md`                   | `docs/zh/concepts/agent-loop.md`                   |
| `docs/en/comparisons/custom-agent-vs-langgraph.md` | `docs/zh/comparisons/custom-agent-vs-langgraph.md` |

If English lives directly under `docs/<category>/` (no `en/` segment yet), the
Chinese counterpart is still `docs/zh/<category>/<same-file>.md`.

Never create a second English file, a duplicate experiment, or a Chinese file
under a different name.

## Frontmatter and revisions

English:

```yaml
---
id: agent-loop
language: en
revision: 3
---
```

Chinese:

```yaml
---
id: agent-loop
language: zh
source_revision: 3
---
```

- The Chinese file copies the identity and relation fields from the English
  source verbatim: `id`, `day`, `date`, `phase`, `status`, `topics`, `concepts`,
  `prerequisites`, `related`, `experiment` / `experiments`, `training_project`,
  `source`.
- Only display strings are translated: `title`, `summary`.
- `revision` is bumped by the author when the English content changes. If an
  English file has no `revision`, read it as `revision: 0`.
- Sync state: `source_revision == revision` → **synced**; otherwise →
  **outdated**. Equal revisions are not proof of sync — review still compares
  sections.
- `assist:` is obsolete. Never add it, and never describe it as the bilingual
  mechanism.

## Commands

`/skill:bilingual-learning` accepts an optional mode and an optional path.

| Command                                   | Meaning                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `/skill:bilingual-learning`               | Analyse the English document and create or update its Chinese counterpart.           |
| `/skill:bilingual-learning brief`         | Same, tuned for ordinary learning notes: tighter Chinese, still a complete document. |
| `/skill:bilingual-learning deep`          | Complex technical concepts: fuller explanation, extra examples, 补充理解.            |
| `/skill:bilingual-learning review <path>` | Read-only check of English/Chinese sync. Reports drift; writes nothing.              |
| `/skill:bilingual-learning translate`     | Explicit full-translation pass: every English section rendered 1:1, no condensing.   |

With no path, use the English document named in the request; if none is named,
the most recently edited English document under `docs/`, and confirm the target
before writing.

## Procedure — create or update

1. Read the English source in full: frontmatter, headings, code fences, links,
   numbers, results.
2. Check the Chinese target.
   - **Missing** → create it (§ New Chinese document).
   - **Exists** → update it (§ Existing Chinese document).
   - "Chinese document missing" is a legitimate end state when the English
     document itself is `planned`, empty, or not yet learned. Say so instead of
     writing content.
3. Write the Chinese document: complete structure, natural technical Chinese,
   no assist blockquotes.
4. Set Chinese frontmatter: same `id`, `language: zh`, `source_revision` equal
   to the English `revision`, copied relation fields.
5. Re-read against the source: every heading, code block, number, path and link
   accounted for; no fabricated fact.
6. Report using § Output format.

### New Chinese document

Copy the English `id`, `day`, `phase`, `topics`, concept / experiment / project
relations, then generate the Chinese body. Translate meaning, not layout
mechanically — but every English section must have a Chinese counterpart.

### Existing Chinese document

Do not regenerate a file the user has been editing.

```text
English diff
        ↓
identify changed sections
        ↓
update corresponding Chinese sections
        ↓
preserve user's Chinese wording when still accurate
```

Match sections by stable anchor (`id`, heading meaning, day number), not by
line position. If the user hand-wrote a section that has no English source —
`## 我的理解`, `## 我仍然不确定`, `## DeepSeek 帮助我理解的地方`, `## 复习要点`,
a `## 补充理解` — leave it untouched unless it is factually contradicted by the
English source; if contradicted, keep the user's text and report the conflict.

Example: the English file gains one extra example paragraph, the Chinese file
already has three hand-written sections. Correct result = one new paragraph in
the matching Chinese section, nothing else rewritten.

## Chinese is not a literal translation

Target: an accurate Chinese learning document that reads naturally for review —
not a sentence-by-sentence machine translation.

Allowed to change: sentence structure, paragraph structure, order of
explanation, how an example is introduced.

Never allowed to change: technical facts, API behaviour, experiment results,
numbers, versions, paths, commands, code, error messages, test results, status
counts.

## Terminology

Keep these in English (and any term the document already treats as a name):

```text
Agent · Agent Loop · Tool Calling · Tool · State · Context ·
Context Engineering · Memory · Session · Checkpoint · Streaming · Message ·
Provider · Embedding · RAG · Reranker · Evaluation · Tracing · Observability ·
LangGraph · FastAPI · Milvus · Neo4j
```

- First occurrence may gloss: `Context Engineering（上下文工程）`.
- Afterwards use the English term; do not invent Chinese replacements.
- If `docs/glossary.yml` exists, its preferred terminology wins over personal
  preference, and the Chinese file must be consistent with it throughout.

## Code, identifiers and links

- Code fences are copied verbatim — no translation, no reformatting, no added
  comments — unless the user explicitly asked to change the code.
- Never change identifiers: `AgentState`, `run_agent()`, `before_llm`,
  `after_tool`, class / function / field names.
- Keep link text and targets stable. A site-internal link that points to
  `/en/concepts/agent-loop` points to `/zh/concepts/agent-loop` in the Chinese
  file; if that Chinese document does not exist yet, keep the `/en/` target and
  list it under § Output format as drift. GitHub, official docs and any
  external URL stay exactly as written.

## Learning notes (`docs/daily/`)

English Day sections map to Chinese headings naturally:

| English                    | Chinese            |
| -------------------------- | ------------------ |
| `Today's Goal`             | `今日目标`         |
| `What I Learned`           | `今天学到了什么`   |
| `What I Didn't Understand` | `仍然不理解的问题` |
| `Experiment`               | `实验`             |
| `My Own Explanation`       | `我的理解`         |
| `Mistakes / Problems`      | `踩过的坑`         |
| `Key Takeaways`            | `复习要点`         |
| `Next`                     | `下一步`           |

Existing Chinese personal headings stay as the user wrote them. Personal learning
records are the user's: never author `我的理解`, `我仍然不确定`,
`DeepSeek 帮助我理解的地方` or `复习要点` on the user's behalf. An empty section
in the Chinese file is correct when the English source has nothing to translate.

## Brief and Deep modes

`brief` never means "less content". It means the Chinese prose is tighter: keep
the core knowledge, cut repetition, aim for fast review. The document stays a
complete knowledge version, not the old supplementary card.

`deep` may go further than the English text: fuller mechanics, more examples,
why a design was chosen, common misconceptions. Extra material never
impersonates the English source — put it under its own heading:

```markdown
## 补充理解
```

## External model answers (DeepSeek and similar)

A model answer is raw material, not fact:

```text
DeepSeek answer → compare with source → identify uncertainty → translate only verified learning content
```

Anything not verified against the English source, the code, or an official
document is marked `待验证`, never stated as certain.

## Never fabricate

The Chinese document may restate the English source. It may never invent it.
Forbidden without exception:

- a Day that was not studied, or a date, title or `status` the English file
  does not carry;
- experiment results, run logs, test counts, benchmark numbers;
- the user's understanding, confusion, questions asked to a model, or a
  DeepSeek conversation;
- a Chinese section that only looks complete — filler that restates nothing.

`Chinese document missing`, `unchanged`, and `待验证` are all valid results. A
gap reported honestly beats content invented to close it.

## Legacy assist blocks

`> **中文理解**` and `> **中文深入理解**` blockquotes are obsolete assistant
content from the previous version of this skill.

```text
old assist block → extract useful information → merge into docs/zh/
```

Merge first, then delete the blockquotes from the English file — this is the one
authorized English edit, so confirm it with the user and touch nothing but the
block lines and the now-obsolete `assist:` frontmatter.

## Review mode

`/skill:bilingual-learning review docs/en/concepts/agent-loop.md` reads both
files and checks:

- **Structure** — same `id`, same filename, same category, headings covered,
  `source_revision` vs `revision`.
- **Content** — new English sections, missing Chinese sections, technical
  facts, numbers, code blocks, links.
- **Terminology** — glossary compliance, consistency of `Agent` / `Tool` /
  `State` and the other protected terms.

Output:

```text
Translation Review

Document:
agent-loop

English revision:
4

Chinese source revision:
3

Status:
OUTDATED

Missing sections:
- Context interaction
- Termination condition

Terminology:
✓

Code:
✓
```

Review writes nothing. Drift is reported explicitly, never silently fixed while
claiming it was a read-only pass.

## Output format

After a write:

```text
Updated:
docs/zh/daily/day-06.md

Source:
docs/en/daily/day-06.md

Status:
synced

Sections added:
- Agent Loop overview
- Tool interaction

Terminology:
✓ glossary compliant

Code:
✓ unchanged
```

Include drift items (unresolved `/zh/` links, `待验证` claims, suspected English
errors) whenever any exist.

## Quality gates

The repository pipeline (`npm run validate`, `npm run generate`, `npm test`)
currently loads `docs/daily`, `docs/concepts` and `docs/comparisons` only — it
does not read `docs/zh/`. So a Chinese-only change does not break it, and it
does not verify the Chinese file either. Run the gates when English files were
touched; the Chinese document is verified by re-reading it against the source
and by review mode. Never claim a gate passed without seeing its output.

## Daily workflow

The loop the user runs — the skill only fills step 4 and step 5's report:

```text
1. 写 English Day
2. 写 / 修改 Set18 experiment
3. 完成自己的理解
4. 运行 bilingual-learning
5. Review Chinese
6. 手动修正
7. git diff
8. commit
```

The final learning judgement always belongs to the user.

## Commits

Follow the prefix style already in `git log` — `dayNN:`, `docs:`, `web:`,
`exp:`, `ci:`. Suggest `day06: add Chinese translation` or
`docs: sync Chinese translation for agent loop`. Never run `git commit` unless
the user explicitly asks.

## Hard rules

1. English is canonical.
2. Chinese is a complete learning document.
3. Never modify English when generating Chinese.
4. Never translate code.
5. Never change identifiers.
6. Preserve technical terminology.
7. Use the glossary.
8. Never invent learning history.
9. Never invent experiment results.
10. Prefer incremental updates.
11. Preserve the user's manually written Chinese notes.
12. Report translation drift explicitly.
13. Do not create duplicate experiment code.
14. Do not introduce i18n frameworks.
15. Do not create an external translation service.
