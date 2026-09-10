import { Link } from "react-router-dom";
import { ConceptGraph } from "../components/concepts/ConceptGraph";
import { PageContainer } from "../components/layout/Layout";
import { Card, SectionTitle, StatusPill } from "../components/ui/Primitives";
import {
  comparisons,
  concepts,
  conceptsByCategory,
  daysForConcept,
} from "../lib/content";
import { excerpt } from "../lib/markdown";
import { statusGlyph, statusTextClass } from "../lib/status";

export function ConceptsPage() {
  const groups = conceptsByCategory();

  return (
    <PageContainer
      wide
      title="Concepts"
      description="The knowledge map. Each node is one file in docs/concepts/ with prerequisites, related nodes and the experiments that proved it."
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {concepts.length} nodes · {comparisons.length} comparisons
        </span>
      }
    >
      <section className="mb-10">
        <SectionTitle>Map</SectionTitle>
        <ConceptGraph concepts={concepts} />
        <p className="mt-2 font-mono text-[11px] text-[var(--faint)]">
          ✓ mastered · ◐ learning · ○ planned — links point from prerequisite to concept
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.category} className="mb-10">
          <SectionTitle hint={`${group.items.length} nodes`}>
            {group.category}
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((concept) => {
              const learnedOn = daysForConcept(concept.id);
              return (
                <Link key={concept.id} to={`/concepts/${concept.id}`} className="block">
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
                        <span>{concept.experiments.length} experiments</span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {comparisons.length > 0 && (
        <section>
          <SectionTitle>Comparisons</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.id}
                to={`/comparisons/${comparison.id}`}
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
