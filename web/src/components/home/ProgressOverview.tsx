import { Link } from "react-router-dom";
import { summary } from "../../lib/content";
import { SectionTitle } from "../ui/Primitives";

export function ProgressOverview() {
  const items = [
    { label: "Days planned", value: summary.totalDays, to: "/progress" },
    { label: "Completed", value: summary.completedDays, to: "/learn" },
    { label: "Concepts", value: summary.conceptsTotal, to: "/concepts" },
    { label: "Experiments", value: summary.experimentsTotal, to: "/experiments" },
  ];

  return (
    <section>
      <SectionTitle
        hint={
          <Link to="/progress" className="hover:text-[var(--text)]">
            details →
          </Link>
        }
      >
        Progress
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]/40"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
              {item.label}
            </p>
            <p className="mt-2 font-mono text-2xl text-[var(--text)]">{item.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] text-[var(--faint)]">
        {summary.conceptsCompleted} mastered · {summary.conceptsLearning} learning ·{" "}
        {summary.experimentsCompleted} experiments completed · {summary.questionsResolved}
        /{summary.questionsAsked} questions resolved
      </p>
    </section>
  );
}
