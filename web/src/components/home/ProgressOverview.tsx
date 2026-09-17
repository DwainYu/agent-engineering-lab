import { Link } from "react-router-dom";
import { summary } from "../../lib/content";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";
import { SectionTitle } from "../ui/Primitives";

export function ProgressOverview() {
  const { language } = useLanguage();

  const items = [
    {
      label: t(language, "label.daysPlanned"),
      value: summary.totalDays,
      to: langHref(language, "progress"),
    },
    {
      label: t(language, "label.completed"),
      value: summary.completedDays,
      to: langHref(language, "learn"),
    },
    {
      label: t(language, "nav.concepts"),
      value: summary.conceptsTotal,
      to: langHref(language, "concepts"),
    },
    {
      label: t(language, "nav.experiments"),
      value: summary.experimentsTotal,
      to: langHref(language, "experiments"),
    },
  ];

  return (
    <section>
      <SectionTitle
        hint={
          <Link to={langHref(language, "progress")} className="hover:text-[var(--text)]">
            {t(language, "label.details")}
          </Link>
        }
      >
        {t(language, "nav.progress")}
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
        {summary.conceptsCompleted} {t(language, "label.completed").toLowerCase()} ·{" "}
        {summary.conceptsLearning} {t(language, "label.status.learning")} ·{" "}
        {summary.experimentsCompleted} {t(language, "label.expsPlural")} ·{" "}
        {summary.questionsResolved}/{summary.questionsAsked}{" "}
        {t(language, "label.resolved").toLowerCase()}
      </p>
    </section>
  );
}
