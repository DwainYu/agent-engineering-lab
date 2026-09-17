import { Link } from "react-router-dom";
import { ConceptGraph } from "../components/concepts/ConceptGraph";
import { PageContainer } from "../components/layout/Layout";
import { Card, SectionTitle, StatusPill } from "../components/ui/Primitives";
import { conceptsByCategory, daysForConcept, docsFor } from "../lib/content";
import { langHref, useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { excerpt } from "../lib/markdown";
import { statusGlyph, statusTextClass } from "../lib/status";

export function ConceptsPage() {
  const { language } = useLanguage();
  const docs = docsFor(language);

  const groups = conceptsByCategory(language);

  return (
    <PageContainer
      wide
      title={t(language, "concepts.title")}
      description={t(language, "concepts.description")}
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {docs.concepts.length} {t(language, "label.nodes")} · {docs.comparisons.length}{" "}
          {t(language, "label.comparisonsPlural")}
        </span>
      }
    >
      <section className="mb-10">
        <SectionTitle>{t(language, "label.map")}</SectionTitle>
        <ConceptGraph concepts={docs.concepts} />
        <p className="mt-2 font-mono text-[11px] text-[var(--faint)]">
          ✓ {t(language, "label.status.completed")} · ◐{" "}
          {t(language, "label.status.learning")} · ○ {t(language, "label.status.planned")}{" "}
          — {t(language, "label.concepts").toLowerCase()} →{" "}
          {t(language, "label.concepts").toLowerCase()}
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.category} className="mb-10">
          <SectionTitle hint={t(language, "label.nodes", { count: group.items.length })}>
            {group.category}
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((concept) => {
              const learnedOn = daysForConcept(language, concept.id);
              return (
                <Link
                  key={concept.id}
                  to={langHref(language, `concepts/${concept.id}`)}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:border-[var(--accent)]/40">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-[15px] font-medium text-[var(--text)]">
                        <span className={statusTextClass[concept.status]} aria-hidden>
                          {statusGlyph[concept.status]}
                        </span>
                        {concept.title}
                      </h3>
                      <StatusPill status={concept.status} showGlyph={false} />
                    </div>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-[var(--dim)]">
                      {concept.summary ?? excerpt(concept.body, 150)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-[var(--faint)]">
                      <span>{concept.progress}%</span>
                      {learnedOn.length > 0 && (
                        <span>{learnedOn.map((day) => `Day ${day.day}`).join(", ")}</span>
                      )}
                      {concept.experiments.length > 0 && (
                        <span>
                          {t(language, "label.exps", {
                            count: concept.experiments.length,
                          })}
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {docs.comparisons.length > 0 && (
        <section>
          <SectionTitle>{t(language, "label.comparisons")}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.comparisons.map((comparison) => (
              <Link
                key={comparison.id}
                to={langHref(language, `comparisons/${comparison.id}`)}
                className="block"
              >
                <Card className="h-full transition-colors hover:border-[var(--accent)]/40">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[15px] font-medium text-[var(--text)]">
                      {comparison.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[11px] text-[var(--faint)]">
                      {comparison.date}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[var(--dim)]">
                    {comparison.summary ?? excerpt(comparison.body, 160)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
