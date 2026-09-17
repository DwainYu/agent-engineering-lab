import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { SectionTitle } from "../components/ui/Primitives";
import { docsFor, progress, summary } from "../lib/content";
import { langHref, useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { githubRepoUrl } from "../lib/paths";

const PRINCIPLES = [
  {
    title: "about.principle.0.title",
    body: "about.principle.0.body",
  },
  {
    title: "about.principle.1.title",
    body: "about.principle.1.body",
  },
  {
    title: "about.principle.2.title",
    body: "about.principle.2.body",
  },
  {
    title: "about.principle.3.title",
    body: "about.principle.3.body",
  },
  {
    title: "about.principle.4.title",
    body: "about.principle.4.body",
  },
  {
    title: "about.principle.5.title",
    body: "about.principle.5.body",
  },
] as const;

const RULES = [
  [
    "docs/{en,zh}/daily/day-NN.md",
    "One file per learning day per language tree. Frontmatter drives the timeline, the calendar and the phase bars.",
  ],
  [
    "docs/{en,zh}/concepts/<id>.md",
    "One file per concept with prerequisites, related nodes, experiments and a progress percentage.",
  ],
  [
    "docs/{en,zh}/comparisons/<id>.md",
    "Architecture decisions: what I compared, what I chose and what it cost.",
  ],
  [
    "docs/{en,zh}/questions/*.md",
    "Open and resolved questions. Unresolved confusion is part of the record.",
  ],
  [
    "experiments/<NNN-slug>/README.md",
    "The lab notebook for an experiment. The runnable code lives in the training repository.",
  ],
];

export function AboutPage() {
  const { language } = useLanguage();
  const first = docsFor(language).days[0];

  return (
    <PageContainer
      title={t(language, "nav.about")}
      description={t(language, "about.description")}
      meta={
        <a
          href={githubRepoUrl("DwainYu/agent-engineering-lab")}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
        >
          DwainYu/agent-engineering-lab ↗
        </a>
      }
    >
      <section className="mb-10 max-w-[850px]">
        <p className="text-[15px] leading-7 text-[var(--dim)]">
          {t(language, "about.intro", {
            lead: t(language, "about.intro.lead"),
            stats: t(language, "about.stats", {
              days: summary.completedDays,
              concepts: docsFor(language).concepts.length,
              experiments: docsFor(language).experiments.length,
            }),
          })}
        </p>
      </section>

      <section className="mb-10">
        <SectionTitle>{t(language, "about.principles")}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map(({ title, body }, index) => (
            <div
              key={title}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <p className="font-mono text-[11px] text-[var(--faint)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-[15px] font-medium text-[var(--text)]">
                {t(language, title)}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[var(--dim)]">
                {t(language, body)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>{t(language, "about.format")}</SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <pre className="font-mono text-[12px] leading-6 text-[var(--dim)]">{`1. pick the next topic          → ROADMAP.md
2. study sources                → docs/${language}/daily/day-NN.md · What I Learned
3. write the smallest program   → tft-agent-set18/experiments/...
4. compare my version with      → docs/${language}/comparisons/
   a framework's version
5. record what is still unclear → docs/${language}/questions/open.md
6. commit and push              → the record is the proof`}</pre>
        </div>
        <p className="mt-3 max-w-[850px] text-[13px] leading-6 text-[var(--faint)]">
          Every completed day note keeps an{" "}
          <span className="font-mono">What I Didn&apos;t Understand</span> section on
          purpose. It is the part that stops the note from becoming performance.
        </p>
      </section>

      <section className="mb-10">
        <SectionTitle>{t(language, "about.sources")}</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--line)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
                <th className="py-2 pr-4 font-normal">{t(language, "about.file")}</th>
                <th className="py-2 font-normal">{t(language, "about.role")}</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map(([path, role]) => (
                <tr key={path} className="border-b border-[var(--line)] last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-[var(--accent)]">
                    {path}
                  </td>
                  <td className="py-2.5 text-[var(--dim)]">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-[850px] text-[13px] leading-6 text-[var(--dim)]">
          <code className="font-mono text-[12px]">npm run generate</code> parses those
          files and writes{" "}
          <code className="font-mono text-[12px]">data/progress.json</code> plus the JSON
          the React pages read.{" "}
          <code className="font-mono text-[12px]">npm run validate</code> fails the build
          when a note is missing a required field or section, or when a reference points
          at a file that does not exist. The site never touches the filesystem at runtime,
          so adding a day is a Markdown commit — not a code change.
        </p>
      </section>

      <section>
        <SectionTitle>{t(language, "about.start")}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Link
            to={langHref(language, `learn/day/${first?.day ?? 1}`)}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/40"
          >
            {t(language, "day.entry", {
              day: String(first?.day ?? 1).padStart(2, "0"),
              title: first?.title ?? t(language, "label.nothing"),
            })}
          </Link>
          <Link
            to={langHref(language, "projects")}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/40"
          >
            {t(language, "about.start.threeRepos")}
          </Link>
          <Link
            to={langHref(language, "progress")}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/40"
          >
            {t(language, "about.start.phases", { count: progress.phases.length })}
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
