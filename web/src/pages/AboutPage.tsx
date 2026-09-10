import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { SectionTitle } from "../components/ui/Primitives";
import { concepts, days, experiments, progress, site, summary } from "../lib/content";
import { githubRepoUrl } from "../lib/paths";

const PRINCIPLES = [
  [
    "Real work only",
    "Nothing on this site is generated as a finished answer. Every page traces back to something I read, ran, broke or fixed.",
  ],
  [
    "Code before framework",
    "I write the loop, the tool registry and the router by hand first, so that using LangGraph later is a decision rather than a dependency.",
  ],
  [
    "One day, one commit",
    "A learning day is not over until the note is committed. The repository history is the proof of work.",
  ],
  [
    "Knowledge needs an experiment",
    "If I cannot reproduce it in ~200 lines of code, I do not understand it yet. That gap becomes a concept with progress below 100.",
  ],
  [
    "Production stays separate",
    "The portfolio project is not a sandbox. Experiments live in the training ground so production pressure and learning curiosity do not corrupt each other.",
  ],
  [
    "The website is a by-product",
    "Markdown plus Git is the source of truth. React only displays it — the build would work with a static HTML generator instead.",
  ],
];

const RULES = [
  [
    "docs/daily/day-NN.md",
    "One file per learning day. Frontmatter drives the timeline, the calendar and the phase bars.",
  ],
  [
    "docs/concepts/<id>.md",
    "One file per concept with prerequisites, related nodes, experiments and a progress percentage.",
  ],
  [
    "docs/comparisons/<id>.md",
    "Architecture decisions: what I compared, what I chose and what it cost.",
  ],
  [
    "docs/questions/*.md",
    "Open and resolved questions. Unresolved confusion is part of the record.",
  ],
  [
    "experiments/<NNN-slug>/README.md",
    "The lab notebook for an experiment. The runnable code lives in the training repository.",
  ],
];

export function AboutPage() {
  return (
    <PageContainer
      title="About"
      description="A public learning record for LLM agent engineering: notes, concepts, experiments and the projects they feed."
      meta={
        <a
          href={githubRepoUrl(site.repo)}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
        >
          {site.repo} ↗
        </a>
      }
    >
      <section className="mb-10 max-w-[850px]">
        <p className="text-[15px] leading-7 text-[var(--dim)]">
          Agent frameworks make it easy to run something without understanding it. This
          repository exists to remove that excuse for me: {summary.completedDays} learning
          days recorded so far, {concepts.length} concepts tracked, {experiments.length}{" "}
          experiments documented, and every claim links to a file, a commit or a program
          that actually ran.
        </p>
      </section>

      <section className="mb-10">
        <SectionTitle>Principles</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map(([title, body], index) => (
            <div
              key={title}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <p className="font-mono text-[11px] text-[var(--faint)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-[15px] font-medium text-[var(--text)]">{title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[var(--dim)]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>How a day is written</SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <pre className="font-mono text-[12px] leading-6 text-[var(--dim)]">{`1. pick the next topic          → ROADMAP.md
2. study sources                → docs/daily/day-NN.md · What I Learned
3. write the smallest program   → tft-agent-set18/experiments/...
4. compare my version with      → docs/comparisons/
   a framework's version
5. record what is still unclear → docs/questions/open.md
6. commit and push              → the record is the proof`}</pre>
        </div>
        <p className="mt-3 max-w-[850px] text-[13px] leading-6 text-[var(--faint)]">
          Every completed day note keeps an{" "}
          <span className="font-mono">What I Didn&apos;t Understand</span> section on
          purpose. It is the part that stops the note from becoming performance.
        </p>
      </section>

      <section className="mb-10">
        <SectionTitle>Where the content comes from</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--line)] font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
                <th className="py-2 pr-4 font-normal">File</th>
                <th className="py-2 font-normal">Role</th>
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
        <SectionTitle>Start reading</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/learn/day/${days[0]?.day ?? 1}`}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/40"
          >
            Day 01 — {days[0]?.title ?? "first note"}
          </Link>
          <Link
            to="/projects"
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/40"
          >
            The three repositories
          </Link>
          <Link
            to="/progress"
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/40"
          >
            {progress.phases.length}-phase roadmap
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
