---
id: learning-system
title: 这套学习系统是怎么运作的
date: 2026-09-17
category: architecture
status: completed
progress: 100
language: zh
source_revision: 1
summary: 仓库本身就是数据库。Markdown 是输入，生成的 JSON 是输出，React 只负责渲染。

prerequisites:
  - agent

related:
  - agent-runtime

experiments: []
---

# 这套学习系统是怎么运作的

## 规则

只有唯一一个 source of truth：**这个仓库里的 Markdown**。`data/progress.json` 以及网站
渲染出来的一切都是 _派生的_。如果网站上的某个数字看着不对，要改的是一个 Markdown 文
件，永远不是生成器。

## 流水线

```text
docs/en/daily/*.md        ┐
docs/en/concepts/*.md     │
docs/zh/daily/*.md        │   frontmatter (YAML)
docs/zh/concepts/*.md     ├─▶ body (Markdown)
docs/{en,zh}/questions/   │
experiments/*/README.md   │
data/site.json            ┘
        ↓
scripts/lib/load.ts        遍历 + 解析 → 带类型的条目 + issues
scripts/lib/validate.ts    跨文档规则
scripts/lib/translation.ts 语言匹配 → synced / outdated / missing
scripts/lib/progress.ts    聚合
        ↓
data/progress.json         提交进 git，人可读
web/src/data/generated/    构建产物
        ↓
React (Vite)               只渲染，不计算
```

`npm run build` 先重新生成派生数据（`prebuild` → `npm run generate`），所以一个刚
clone 下来的仓库即使 git 里没有陈旧的 JSON，也能构建出完整站点。

## 三个项目，三份职责

```text
agent-engineering-lab → tft-agent-set18 → tft-agent-set17
      解释                证明              交付
```

- **Lab**（本仓库）负责记录并展示学习过程。它的 `experiments/*/README.md` 里放的是
  _描述、代码片段和结果_ —— 实验代码本身不会被复制到这里。
- **Set 18** 是训练场：最小的、手写的实现，实验可以在没有 API key 的情况下用
  `--mock` 模式跑。
- **Set 17** 是产品。只有在 Set 18 里被证明过的想法才能进入这里。

Frontmatter 承载了这条线索：每个 Day、Concept 和 Experiment 都可以设置
`training_project` 与 `production_project`，各带 `repo` 和 `path`，网站把两者都渲染成
链接。

## 为什么浏览器从不解析 Markdown

两个理由，都很实际：

1. 扫描文件需要文件系统；GitHub Pages 的打包产物里没有。
2. 在 Node 里生成，意味着校验发生在站点构建 _之前_。缺一个 `phase` 字段会让 CI 挂
   掉，而不是渲染出一张空卡片。

## 添加内容

| 我想…                   | 我改…                                    | React 代码 |
| ----------------------- | ---------------------------------------- | ---------- |
| 新增一个学习日          | `docs/en/daily/day-04.md`                | 无         |
| 新增它的中文版          | `docs/zh/daily/day-04.md`                | 无         |
| 新增一个 concept        | `docs/en/concepts/context-engineering.md`| 无         |
| 记录一个 experiment     | `experiments/004-state/README.md`        | 无         |
| 新增一篇架构文档        | `docs/en/architecture/<name>.md`         | 无         |
| 写一篇对比              | `docs/en/comparisons/<slug>.md`          | 无         |
| 提一个问题              | `docs/en/questions/open.md` → `resolved.md` | 无      |

## 双语文档

英文和中文各自拥有完整的 Markdown 文档树：

```text
docs/en/     canonical 技术事实来源
docs/zh/     完整的中文学习 / 复习版本
```

中文**不是**逐句机器翻译，也不是夹在英文段落下面的辅助卡片。它是独立的、可以拿来复
习的完整中文文档 —— 允许为了学习目的重组句子，但技术事实、API 名、类名、函数名、文件
名、代码和实验结果一律不动。

对应关系靠 **stable id**，不靠文件名：

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

Content Engine 比较两个数字，得出翻译状态：

| 比较                                        | 状态      |
| ------------------------------------------- | --------- |
| `source_revision == revision`               | `synced`  |
| `source_revision != revision`               | `outdated`|
| 英文存在，中文不存在                        | `missing` |

状态写在 `web/src/data/generated/sync.json`，并在 Progress 页面显示
`English Days` / `Chinese Days` / `Translation Sync` 三行。

> `assist:` frontmatter 和 `> **中文理解**` blockquote 是上一代的方案，已经全部迁移
> 到 `docs/zh/`，并且不再被任何代码读取。

## 路由与语言切换

```text
/en/learn/day/1     /zh/learn/day/1
/en/concepts/...    /zh/concepts/...
```

Header 上的 `EN | 中文` 会**跳转**到同一种语言路径、同一个文档 id 的页面，而不是只
改一个 UI state。URL 是最终的 source of truth，`localStorage` 只记住偏好（key
`agent-lab-language`，默认 `en`）。没有语言前缀的旧链接（`/learn/day/1`）会跳转到
`/en/learn/day/1`，不会 404。

## 术语表

`docs/glossary.yml` 定义了受保护的技术术语和它们的中文说法。英文术语保持英文，首次
出现可以加中文注释（`Context Engineering（上下文工程）`），之后不再翻译。

## 补全中文文档

用项目里的 skill：

```text
/skill:bilingual-learning        # 常规笔记：中文更紧凑，但仍是完整文档
/skill:bilingual-learning deep   # 复杂概念：更充分的解释、更多例子、补充理解
/skill:bilingual-learning review # 只读检查中英是否漂移
```
