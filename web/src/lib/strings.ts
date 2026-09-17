import type { Language } from "../../../scripts/lib/language";
import type { Status } from "../../../scripts/lib/types";

/**
 * UI chrome, not content.
 *
 * Document bodies live in `docs/<lang>/…` and reach the app through the
 * generated JSON. This table only holds the labels the React shell itself
 * draws — navigation, section titles, empty states, counts. Terms defined in
 * `docs/glossary.yml` stay English.
 */
const STRINGS = {
  "nav.home": { en: "Home", zh: "首页" },
  "nav.learn": { en: "Learn", zh: "学习" },
  "nav.concepts": { en: "Concepts", zh: "概念" },
  "nav.experiments": { en: "Experiments", zh: "实验" },
  "nav.projects": { en: "Projects", zh: "项目" },
  "nav.progress": { en: "Progress", zh: "进度" },
  "nav.about": { en: "About", zh: "关于" },

  "lang.switch": { en: "Language", zh: "语言" },
  "lang.missing.zh": { en: "Chinese version not ready yet", zh: "中文版本尚未完成" },
  "lang.missing.en": { en: "English source missing", zh: "英文原文缺失" },
  "lang.view.en": { en: "Read the English version", zh: "阅读英文版本" },
  "lang.view.zh": { en: "Read the Chinese version", zh: "阅读中文版本" },

  "common.github": { en: "GitHub", zh: "GitHub" },
  "common.activeDays": { en: "active days", zh: "有记录的天数" },

  "label.concepts": { en: "Concepts", zh: "概念" },
  "label.experiments": { en: "Experiments", zh: "实验" },
  "label.days": { en: "{count} days", zh: "共 {count} 天" },
  "label.exps": { en: "{count} experiments", zh: "{count} 个实验" },
  "label.nodes": { en: "{count} nodes", zh: "{count} 个节点" },
  "about.stats": {
    en: "{days} learning days recorded so far, {concepts} concepts tracked, {experiments} experiments documented, and every claim links to a file, a commit or a program that actually ran.",
    zh: "目前已记录 {days} 个学习日，跟踪 {concepts} 个概念，写下 {experiments} 个实验，而且每一条结论都链接到一个真实的文件、一次 commit 或一个确实跑过的程序。",
  },
  "about.intro.lead": {
    en: "Agent frameworks make it easy to run something without understanding it. This repository exists to remove that excuse for me:",
    zh: "Agent 框架很容易让人在不懂原理的情况下把东西跑起来。这个仓库是为了替我消除这个借口而存在的：",
  },
  "about.intro": { en: "{lead} {stats}", zh: "{lead}{stats}" },
  "about.principles": { en: "Principles", zh: "原则" },
  "about.format": { en: "How a day is written", zh: "一天是怎么写成的" },
  "about.sources": { en: "Where the content comes from", zh: "内容从哪里来" },
  "about.file": { en: "File", zh: "文件" },
  "about.role": { en: "Role", zh: "作用" },
  "about.start": { en: "Start reading", zh: "开始阅读" },
  "projects.relate": { en: "How the three relate", zh: "三者如何互相咬合" },
  "progress.planned": { en: "{count} days planned", zh: "计划 {count} 天" },
  "progress.activeDays": { en: "active days", zh: "有记录的天数" },
  "learn.allPhases": { en: "All phases", zh: "全部阶段" },
  "learn.complete": { en: "{percent}% complete", zh: "完成度 {percent}%" },
  "label.phases": { en: "Phases", zh: "阶段" },
  "label.sources": { en: "Sources", zh: "资料来源" },
  "label.codeLocation": { en: "Code location", zh: "代码位置" },
  "label.code": { en: "code", zh: "代码" },
  "label.notebook": { en: "English notebook", zh: "英文 notebook" },
  "label.nothing": { en: "Nothing yet", zh: "还没有" },
  "label.planned": { en: "planned", zh: "计划中" },
  "label.daysPlanned": { en: "Days planned", zh: "已计划天数" },
  "label.completed": { en: "Completed", zh: "已完成" },
  "label.streak": { en: "streak", zh: "连续记录" },
  "label.details": { en: "details →", zh: "详情 →" },
  "label.timeline": { en: "Learning timeline", zh: "学习时间线" },
  "label.continue": { en: "Continue learning", zh: "继续学习" },
  "label.headline": {
    en: "Understand Agents by building them again",
    zh: "通过重新构建来理解 Agent",
  },
  "label.map": { en: "Map", zh: "知识地图" },
  "label.comparisons": { en: "Comparisons", zh: "对比" },
  "label.mastery": { en: "Concept mastery", zh: "概念掌握度" },
  "label.englishDays": { en: "English Days", zh: "英文学习日" },
  "label.chineseDays": { en: "Chinese Days", zh: "中文学习日" },
  "label.translationSync": { en: "Translation Sync", zh: "翻译同步" },
  "label.open": { en: "open", zh: "待解决" },
  "label.resolved": { en: "resolved", zh: "已解决" },
  "footer.pipeline": { en: "Pipeline", zh: "流水线" },
  "footer.note": {
    en: "Every commit regenerates this site — no page here is hand-maintained HTML.",
    zh: "每次提交都会重新生成站点 —— 这里没有手工维护的 HTML。",
  },
  "footer.projects": { en: "Projects", zh: "项目" },
  "pipeline.learn": { en: "Learn", zh: "学习" },
  "pipeline.reproduce": { en: "Reproduce", zh: "复现" },
  "pipeline.experiment": { en: "Experiment", zh: "实验" },
  "pipeline.build": { en: "Build", zh: "构建" },
  "day.counter": { en: "Day {current} / {total}", zh: "第 {current} / {total} 天" },
  "day.previous": { en: "← Previous Day", zh: "← 上一天" },
  "day.next": { en: "Next Day →", zh: "下一天 →" },
  "day.entry": { en: "Day {day} · {title}", zh: "第 {day} 天 · {title}" },
  "notFound.body1": {
    en: "No markdown file resolves to this route. If it should exist, add it under",
    zh: "没有 Markdown 文件对应这个路由。如果它应该存在，请在",
  },
  "notFound.body2": { en: "and run", zh: "目录下添加，然后运行" },
  "heatmap.source1": { en: "Each cell comes from", zh: "每个格子都来自" },
  "heatmap.source2": { en: "frontmatter.", zh: "的 frontmatter。" },
  "about.description": {
    en: "A public learning record for LLM agent engineering: notes, concepts, experiments and the projects they feed.",
    zh: "公开的 LLM Agent 工程学习记录：笔记、概念、实验，以及它们喂养的项目。",
  },
  "concepts.title": {
    en: "Concepts",
    zh: "概念",
  },
  "concepts.description": {
    en: "The knowledge map. Each node is one file in docs/en/concepts/ with prerequisites, related nodes and the experiments that proved it.",
    zh: "知识地图。每个节点都是 docs/en/concepts/ 下的一个文件，带有前置概念、相关节点和验证过它的实验。",
  },
  "experiments.description": {
    en: "One experiment per directory in experiments/. The README holds the lab notebook; the runnable code lives in the training repository.",
    zh: "experiments/ 下每个目录一个实验。README 是实验记录本；可运行代码放在训练仓库里。",
  },
  "learn.title": {
    en: "Learning",
    zh: "学习",
  },
  "learn.description": {
    en: "Every unit of study is one Markdown file in docs/en/daily/. The list you see is generated from them — adding a day needs no code change.",
    zh: "每个学习单元都是 docs/en/daily/ 下的一个 Markdown 文件。你看到的列表由它们生成 —— 新增一天不需要改代码。",
  },
  "learn.filterPhase": {
    en: "Filter by phase",
    zh: "按阶段筛选",
  },
  "learn.noMatch": {
    en: "No days match this filter",
    zh: "没有符合条件的学习日",
  },
  "learn.noMatchBody": {
    en: "Clear the status or phase filter to see the rest of the timeline.",
    zh: "清除状态或阶段筛选，即可看到完整时间线。",
  },
  "progress.description": {
    en: "Everything on this page is computed by scripts/generate-progress.ts and written to data/progress.json. Nobody edits it by hand.",
    zh: "本页所有数字都由 scripts/generate-progress.ts 计算并写入 data/progress.json。没有人手工编辑它。",
  },
  "questions.emptyTitle": {
    en: "No questions recorded",
    zh: "还没有记录问题",
  },
  "questions.emptyBody": {
    en: "docs/en/questions/ holds the confusion that still has no answer.",
    zh: "docs/en/questions/ 存放那些还没有答案的困惑。",
  },
  "projects.description": {
    en: "The learning system spans three repositories with one rule each: record it, practise it, ship it. Keeping them separate is what stops practice code from polluting production and production pressure from polluting practice.",
    zh: "这套学习系统跨三个仓库，各守一条规则：记录它、练习它、交付它。把它们分开，才能让练习代码不污染生产、生产压力不污染练习。",
  },
  "hero.line1": { en: "Understand Agents by", zh: "理解 Agent 的方式是" },
  "hero.line2": { en: "building them again", zh: "重新把它们造出来" },
  "home.focus": { en: "Current focus", zh: "当前重点" },
  "home.featured": { en: "Featured experiments", zh: "精选实验" },
  "home.landing": { en: "Where the learning lands", zh: "学习成果的落点" },
  "home.experimentsLinked": { en: "experiments linked", zh: "个已关联实验" },
  "day.experiment": { en: "Experiment", zh: "实验" },
  "day.training": { en: "Training project", zh: "训练项目" },
  "concept.prerequisites": { en: "Prerequisites", zh: "前置概念" },
  "concept.related": { en: "Related", zh: "相关概念" },
  "concept.unlocks": { en: "Unlocks", zh: "被依赖" },
  "concept.learnedOn": { en: "Learned on", zh: "出现于" },
  "concept.noPrerequisites": { en: "Starts from zero.", zh: "从零开始。" },
  "concept.noRelated": { en: "No sibling concepts linked.", zh: "还没有关联的概念。" },
  "concept.noUnlocks": { en: "Nothing depends on this yet.", zh: "还没有概念依赖它。" },
  "concept.NoDays": {
    en: "No day references this concept.",
    zh: "还没有学习日引用这个概念。",
  },
  "concept.notReproduced": {
    en: "Not reproduced in code yet — that is the next step.",
    zh: "还没有用代码复现 —— 这是下一步。",
  },
  "concept.noLearning": {
    en: "No concept is marked as learning yet.",
    zh: "还没有概念被标记为学习中。",
  },
  "concept.empty": {
    en: "docs/en/concepts/ is empty.",
    zh: "docs/en/concepts/ 是空的。",
  },
  "status.planned": { en: "Planned", zh: "计划中" },
  "status.learning": { en: "Learning", zh: "学习中" },
  "status.completed": { en: "Completed", zh: "已完成" },
  "home.allExperiments": { en: "all experiments →", zh: "全部实验 →" },
  "home.emptyExperiments": { en: "No experiments recorded yet.", zh: "还没有记录实验。" },
  "home.noDays": { en: "No learning days recorded yet.", zh: "还没有学习记录。" },
  "home.noConcepts": { en: "docs/concepts/ is empty.", zh: "docs/concepts/ 是空的。" },
  "home.noConceptLearning": {
    en: "No concept is marked as learning yet.",
    zh: "还没有概念被标记为学习中。",
  },
  "home.projectStats": {
    en: "{days} days · {concepts} concepts · {experiments} experiments linked",
    zh: "共 {days} 天 · {concepts} 个概念 · {experiments} 个已关联实验",
  },
  "home.projectCta": { en: "The three-repo system →", zh: "三仓库体系 →" },
  "label.allDays": { en: "all days →", zh: "全部天 →" },
  "label.role.training": { en: "Training ground", zh: "训练场" },
  "label.role.production": { en: "Production project", zh: "生产项目" },
  "label.role.lab": { en: "Lab", zh: "实验室" },
  "label.experimentsPlural": { en: "experiments", zh: "个实验" },
  "label.conceptsPlural": { en: "concepts", zh: "个概念" },
  "label.daysPlural": { en: "days", zh: "天" },
  "label.expsPlural": { en: "exps", zh: "个实验" },
  "label.projects": { en: "repositories", zh: "个仓库" },
  "label.comparisonsPlural": { en: "comparisons", zh: "个对比" },
  "label.status.completed": { en: "completed", zh: "已完成" },
  "label.status.learning": { en: "learning", zh: "学习中" },
  "label.status.planned": { en: "planned", zh: "计划中" },
  "progress.comparisonsSub": { en: "architecture notes", zh: "架构笔记" },
  "progress.questions": { en: "Questions", zh: "问题" },
  "progress.streakNote": { en: "active days", zh: "有记录的天数" },
  "progress.phaseFooter": {
    en: "{completed}/{total} days · {experiments} exps · {concepts} concepts · {percent}%",
    zh: "已完成 {completed}/{total} 天 · {experiments} 个实验 · {concepts} 个概念 · {percent}%",
  },
  "progress.questionOpen": { en: "open", zh: "待解决" },
  "progress.questionResolved": { en: "resolved", zh: "已解决" },
  "about.principle.0.title": { en: "Real work only", zh: "只写真实产出" },
  "about.principle.0.body": {
    en: "Nothing on this site is generated as a finished answer. Every page traces back to something I read, ran, broke or fixed.",
    zh: "本页面上的每一项结论都来自我读过的东西、跑过的代码、挂过的问题或改过的错误。",
  },
  "about.principle.1.title": { en: "Code before framework", zh: "先写代码，再用框架" },
  "about.principle.1.body": {
    en: "I write the loop, the tool registry and the router by hand first, so that using LangGraph later is a decision rather than a dependency.",
    zh: "执行循环、工具注册表与路由都是手写出来的，这样后续使用 LangGraph 是主动选择而不是依赖绑架。",
  },
  "about.principle.2.title": { en: "One day, one commit", zh: "一天一提交" },
  "about.principle.2.body": {
    en: "A learning day is not over until the note is committed. The repository history is the proof of work.",
    zh: "笔记没有提交之前，这一天还没结束。仓库历史就是工作证明。",
  },
  "about.principle.3.title": {
    en: "Knowledge needs an experiment",
    zh: "知识需要实验验证",
  },
  "about.principle.3.body": {
    en: "If I cannot reproduce it in ~200 lines of code, I do not understand it yet. That gap becomes a concept with progress below 100.",
    zh: "如果不能用约两百行代码复现，说明还没理解。这部分空档会变成进度不到 100 的概念节点。",
  },
  "about.principle.4.title": { en: "Production stays separate", zh: "生产与练习分开" },
  "about.principle.4.body": {
    en: "The portfolio project is not a sandbox. Experiments live in the training ground so production pressure and learning curiosity do not corrupt each other.",
    zh: "作品集不是沙盒。实验在训练场里进行，避免生产压力污染学习的好奇心。",
  },
  "about.principle.5.title": { en: "The website is a by-product", zh: "网站是副产品" },
  "about.principle.5.body": {
    en: "Markdown plus Git is the source of truth. React only displays it — the build would work with a static HTML generator instead.",
    zh: "Markdown 加 Git 才是来源。React 只是展示层 —— 换个静态 HTML 生成器也能跑。",
  },
  "about.start.threeRepos": { en: "The three repositories", zh: "三个仓库" },
  "about.start.phases": { en: "{count}-phase roadmap", zh: "{count} 阶段路线图" },
  "concept.experiment": { en: "Experiments", zh: "实验" },
  "concept.noExperiments": { en: "No experiment linked yet.", zh: "还没有关联的实验。" },
  "experiment.concepts": { en: "Concepts", zh: "概念" },
  "experiment.noConcepts": { en: "No concepts linked yet.", zh: "还没有关联的概念。" },
  "comparison.back": { en: "← Comparisons", zh: "← 对比" },
  "concept.back": { en: "← Concepts", zh: "← 概念" },
  "experiment.back": { en: "← Experiments", zh: "← 实验" },
  "heatmap.calendar": { en: "Learning calendar", zh: "学习日历" },
  "heatmap.dayX": {
    en: "Day {day} — {title} ({status})",
    zh: "第 {day} 天 — {title} ({status})",
  },
  "projects.about.arrows": {
    en: "↑ arrows are implied left-to-right; every hop is a commit in a different repository",
    zh: "↑ 箭头从左到右；每一步都是不同仓库里的一次提交",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

/**
 * Look up one label and interpolate `{name}` placeholders.
 * The English table declares every key; a Chinese entry that is missing falls
 * back to English instead of rendering `undefined`.
 */
export function t(
  language: Language,
  key: StringKey,
  values?: Record<string, string | number>,
) {
  const entry = STRINGS[key];
  const raw = entry === undefined ? key : (entry[language] ?? entry.en);
  if (values === undefined) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function statusText(language: Language, status: Status): string {
  return t(language, `status.${status}` as StringKey);
}
