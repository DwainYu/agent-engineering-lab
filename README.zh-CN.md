# Agent Engineering Lab

> 学习 → 复现 → 实验 → 构建

[English](README.md) · 中文

![CI](https://github.com/DwainYu/agent-engineering-lab/actions/workflows/ci.yml/badge.svg)

一个以实践为核心的 Agent Engineering（智能体工程）学习实验室。仓库里同时存放每日学习
记录、长期沉淀的 concept（概念节点）、experiment 文档、架构对比、尚未解决的问题，
以及一整套中英双语知识库；网站由这个仓库自身的内容生成，托管在 GitHub Pages。

它不是教程网站，也不是 AI 博客，更不是翻译项目：每条笔记都带日期、来源和 `status`；
每一个关于 Agent 如何工作的判断，都对应一篇 experiment 文档或训练仓库里的一段代码；
网站上的每一个数字都从 Markdown 派生，而不是手写。

在线站点：<https://dwainyu.github.io/agent-engineering-lab/>

## 为什么做这件事

目标不是"会用"某个 Agent 框架，而是理解：

- Agent Loop（Agent 执行循环）如何运转
- Tool Calling（工具调用）如何实现
- State（状态）如何管理
- Context（上下文）如何构造
- Memory（记忆）与 Session（会话）如何工作
- RAG（检索增强生成）如何搭建与衡量
- Agent 如何做 Evaluation（评测）
- Agent 系统如何部署、如何获得 Observability（可观测性）

## 三仓架构

三个仓库，各自只负责一件事：

```text
agent-engineering-lab      explain   ← 你在这里
        │  知识库 · experiment 文档 · 进度 · 学习站点
        ▼
tft-agent-set18            prove     最小的、手写的实现
        │  被验证过的想法
        ▼
tft-agent-set17            ship      面向生产的 Agent 项目
        │
        ▼
正式项目 / Portfolio
```

| 仓库                                                                        | 职责                                        |
| --------------------------------------------------------------------------- | ------------------------------------------- |
| [`agent-engineering-lab`](https://github.com/DwainYu/agent-engineering-lab) | 知识库、experiment 文档、进度记录、学习站点 |
| [`tft-agent-set18`](https://github.com/DwainYu/tft-agent-set18)             | 可运行的 Agent Engineering 训练场           |
| [`tft-agent-set17`](https://github.com/DwainYu/tft-agent-set17)             | 面向生产的 Agent 项目 / Portfolio           |

Set 18 是训练场，不是生产系统：只依赖标准库的最小实现，用来把机制跑通。Set 17 是面向
生产的项目，不是可以随意"公开学习"的草稿本。只有在 Set 18 中被验证过的想法才进入
Set 17。把三者分开，本身就是这套方法的一部分。

## 学习方法

每个学习单元都走同一条闭环：

```text
Learn → Read Source → Ask AI → Implement → Review → Document → Commit
```

两条规则保证记录可信：

1. 每个学习日至少对应一个 Git commit。
2. AI 生成的回答只是原材料。一个概念只有在被验证、被实现、并由自己重新写出解释之后
   （学习日笔记里的 `## 我的理解`），才算进入学习记录。

## 双语知识库

实验室维护两套完整的文档树：

```text
docs/en/    canonical 技术事实来源
docs/zh/    完整的中文学习 / 复习版本
```

英文是技术事实的唯一来源。中文侧的每一篇文档都拥有自己的路由和 URL，本身就是一篇完整的
学习文档——不是藏在英文下面的翻译浮层，不是夹在英文段落后的辅助卡片，也不是逐句机器
翻译，可以直接拿来复习。

中英对应靠稳定的 `id`，不靠文件名：

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

英文侧持有 `revision`，中文侧声明自己是基于哪个 `source_revision` 翻译的。Content
Engine 比较这两个数字，推导出每篇文档的翻译状态：

| 判断                          | 翻译状态          |
| ----------------------------- | ----------------- |
| 中文文档不存在                | `missing` 待翻译  |
| `source_revision == revision` | `synced` 已同步   |
| `source_revision != revision` | `outdated` 待更新 |

每篇文档的状态写在 `web/src/data/generated/sync.json`，`npm run validate` 会打印整套
知识库的 `synced` / `outdated` / `missing` 统计。

`docs/glossary.yml` 是术语契约：标识符、API 名、类名、函数名、文件名和代码一律不翻译；
中文注释只在术语首次出现时给出，例如 `Context Engineering（上下文工程）`，之后保持英文。

中英文档对由项目内的 Pi skill 维护，见
`.pi/skills/bilingual-learning/SKILL.md`：它把一篇英文笔记整理成完整的中文学习文档，
也可以只读检查两侧是否漂移。

## 语言切换

站点提供两套完整视图 —— English 与 中文，都在带语言前缀的路由下：

```text
https://dwainyu.github.io/agent-engineering-lab/en/
https://dwainyu.github.io/agent-engineering-lab/zh/
```

英文是默认语言。Header 里的 `EN | 中文` 会**跳转**到另一个语言下的同一个文档
（`/en/learn/day/1` → `/zh/learn/day/1`），而不是仅仅切换一个前端状态：语言由 URL
决定，`localStorage` 只负责记住偏好，用于没有前缀的链接。

当一篇文档还没有对应译文时，页面会直接说明，并给出已存在的那个版本的链接——站点不会
伪造翻译。

## 实验代码与实验文档

实验代码只有一份，位于训练仓库；Lab 存放的是文档：

```text
tft-agent-set18
  experiments/005-context-trim/            ← 唯一的代码副本

agent-engineering-lab
  experiments/005-context-trim/README.md   ← 英文 lab notebook（id + revision）
  docs/zh/experiments/005-context-trim.md  ← 中文对应文档（source_revision）
```

英文 notebook 与实验目录同名，放在 `experiments/<id>/README.md`；中文复习版本放在
`docs/zh/experiments/`。两侧绑定同一个 experiment `id`，校验器会让"没有对应实验目录的
实验文档"直接失败。学习日和 concept 通过 `training_project` 链接到 Set 18，通过
`production_project` 链接到 Set 17。Lab 与 Set 18 之间不存在第二份代码。

## 学习路线

| 阶段 | 主题                    |
| ---- | ----------------------- |
| 1    | Agent 基础              |
| 2    | Agent Runtime（运行时） |
| 3    | Context（上下文）       |
| 4    | Memory（记忆）          |
| 5    | RAG（检索增强生成）     |
| 6    | Evaluation（评测）      |
| 7    | Production（生产化）    |
| 8    | 真实项目                |

带验收条件的完整清单：[ROADMAP.md](ROADMAP.md)。

## 仓库结构

```text
docs/
├── en/                 canonical 技术来源
│   ├── daily/          一天一篇学习记录
│   ├── concepts/       长期沉淀的概念节点
│   ├── comparisons/    架构与技术选型对比
│   ├── architecture/   学习系统与 Agent 运行时的设计文档
│   └── questions/      open.md / resolved.md — 还没搞懂的问题
└── zh/                 完整的中文学习版本
    ├── daily/
    ├── concepts/
    ├── experiments/    experiments/*/README.md 的中文复习文档
    ├── comparisons/
    ├── architecture/
    └── questions/

docs/glossary.yml       两套树共用的术语契约
experiments/            英文 lab notebook — 一个实验一个目录，只放文档
prompts/                学习过程中实际使用的 prompt
data/                   site.json（站点配置）· progress.json（生成物）
scripts/                Content Engine：load → validate → generate
web/                    React + Vite + Tailwind 前端
tests/                  内容、语言与页面的测试
```

两套树由同一个 Content Engine 按同一套规则读取，所以中文侧缺篇或者落后于英文时会被
报告出来，而不是被悄悄忽略。

## Content Engine

仓库本身就是数据源，网站由 Markdown + frontmatter 生成，浏览器从不解析 Markdown：

```text
Markdown + frontmatter
        ↓  scripts/lib/load.ts        遍历 docs/{en,zh} + experiments，解析、定类型
        ↓  scripts/lib/validate.ts    跨文档与中英配对规则
        ↓  scripts/lib/translation.ts synced / outdated / missing
        ↓  scripts/lib/progress.ts    聚合
        ↓
JSON   data/progress.json · web/src/data/generated/*.json
        ↓
React  只渲染，不计算
        ↓
GitHub Pages
```

`data/progress.json` 与 `web/src/data/generated/` 会提交进 git，CI 会重新生成并在结果
不一致时失败，因此站点不可能展示一个过期的数字。

## 添加内容

| 想添加       | 需要写的文件                                                                |
| ------------ | --------------------------------------------------------------------------- |
| 一个学习日   | `docs/en/daily/day-XX.md` 与 `docs/zh/daily/day-XX.md`                      |
| 一个 concept | `docs/en/concepts/example.md` 与 `docs/zh/concepts/example.md`              |
| 一篇实验文档 | `experiments/006-example/README.md` 与 `docs/zh/experiments/006-example.md` |
| 一篇对比     | `docs/en/comparisons/example.md` 与 `docs/zh/comparisons/example.md`        |
| 一篇架构文档 | `docs/en/architecture/example.md` 与 `docs/zh/architecture/example.md`      |
| 一个问题     | `docs/en/questions/open.md`，得到答案后移入 `resolved.md`                   |

写完运行 `npm run validate`。校验器强制的规则：

- `id` 是中英配对的主键；`language` 必须与文件所在的树一致。
- 文件名必须等于 `id`（concept / comparison），或等于 `day` 序号（`day-07.md` ⇔ `day: 7`）。
- 中文文档必须有同 `id` 的英文原文，并且必须声明 `source_revision`。
- `status: completed` 的学习日必须包含完整的章节，中英文各有各的必填标题。

如果中文版还没准备好，就不要创建这个文件：Engine 会把它记为 `missing`。绝不为填补空缺
而编造内容。

添加内容永远不需要改 React 代码。

## 开发

```bash
npm install     # Node >= 22.12
npm run dev     # http://localhost:5173/  （热更新，base path 为 /）

npm run build   # 重新生成派生数据、typecheck、打包到 dist/
npm run preview # http://localhost:4173/
```

生成物已提交进 git，所以刚 clone 下来可以直接 `npm run dev`。改过内容后，提交前重新
生成：

```bash
npm run generate
```

## 在线站点

| 入口    | 地址                                                                               |
| ------- | ---------------------------------------------------------------------------------- |
| English | <https://dwainyu.github.io/agent-engineering-lab/en/>                              |
| 中文    | <https://dwainyu.github.io/agent-engineering-lab/zh/>                              |
| 根路径  | <https://dwainyu.github.io/agent-engineering-lab/>（跳转到记忆中的语言，默认英文） |

站点栏目：`/learn`（每日学习记录）、`/concepts`、`/experiments`、`/comparisons`、
`/projects`、`/progress`、`/about`，每个栏目都在自己的语言前缀下。Progress 页面统计
当前语言的学习日、concept、experiment、对比与未解决问题；双语覆盖情况由
`npm run validate` 报告，而不是由页面展示。深链可用，是因为构建会把 `404.html`
输出成同一个 SPA 入口。

## 质量门禁

```bash
npm run validate    # frontmatter、跨文档规则、中英配对
npm run lint        # eslint
npm run typecheck   # 应用、脚本与测试
npm test            # vitest
npm run check       # validate + lint + typecheck + test
```

CI（`.github/workflows/ci.yml`）在每次推送到 `main` 和每个 pull request 上运行校验、
lint、类型检查、测试和构建，并额外断言生成物已提交且是最新的。
`.github/workflows/deploy.yml` 把 `main` 发布到 GitHub Pages：

```text
main → GitHub Actions → GitHub Pages
```

## 学习理念

每篇 concept 都按同样的顺序回答同样的问题：

1. `定义` —— 它是什么
2. `为什么需要它` —— 它解决什么问题
3. `最小实现` —— 能真正跑起来的最小版本
4. `真实项目里` —— 它在 Set 18 / Set 17 中的位置
5. `常见问题` —— 上生产后会怎样坏掉

## 许可证

MIT
