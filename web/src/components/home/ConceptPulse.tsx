import { Link } from "react-router-dom";
import { docsFor, currentFocus, progress } from "../../lib/content";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";
import { statusGlyph, statusTextClass } from "../../lib/status";
import { ProgressBar, SectionTitle } from "../ui/Primitives";

/** Latest concept activity — the cheapest possible "knowledge pulse" widget. */
export function ConceptPulse() {
  const { language } = useLanguage();
  const docs = docsFor(language);

  const focus = currentFocus(language);
  const ranked = docs.concepts
    .slice()
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6);

  return (
    <section>
      <SectionTitle
        hint={
          <Link to={langHref(language, "concepts")} className="hover:text-[var(--text)]">
            {t(language, "label.map")} →
          </Link>
        }
      >
        {t(language, "home.focus")}
      </SectionTitle>

      <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
          {focus ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
                {focus.category}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                <Link
                  to={langHref(language, `concepts/${focus.id}`)}
                  className="hover:text-[var(--accent)]"
                >
                  {focus.title}
                </Link>
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[var(--dim)]">
                {focus.summary ?? t(language, "home.noConceptLearning")}
              </p>
              <div className="mt-4">
                <ProgressBar
                  value={focus.progress}
                  status={focus.status}
                  label={focus.title}
                />
              </div>
            </>
          ) : (
            <p className="font-mono text-[12px] text-[var(--faint)]">
              {t(language, "home.noConceptLearning")}
            </p>
          )}
        </div>

        <ul className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)]">
          {ranked.map((concept) => (
            <li key={concept.id} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={`font-mono text-xs ${statusTextClass[concept.status]}`}
                aria-hidden
              >
                {statusGlyph[concept.status]}
              </span>
              <Link
                to={langHref(language, `concepts/${concept.id}`)}
                className="min-w-0 flex-1 truncate text-[13px] text-[var(--text)] hover:text-[var(--accent)]"
              >
                {concept.title}
              </Link>
              <span className="font-mono text-[11px] text-[var(--faint)]">
                {concept.progress}%
              </span>
            </li>
          ))}
          {ranked.length === 0 && (
            <li className="px-4 py-6 text-center font-mono text-[12px] text-[var(--faint)]">
              {t(language, "home.noConcepts")}
            </li>
          )}
        </ul>
      </div>

      <p className="mt-3 font-mono text-[11px] text-[var(--faint)]">
        phases:{" "}
        {progress.phases.map((phase) => `${phase.id} ${phase.progress}%`).join(" · ")}
      </p>
    </section>
  );
}
