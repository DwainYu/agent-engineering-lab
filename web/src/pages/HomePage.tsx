import { ConceptPulse } from "../components/home/ConceptPulse";
import { FeaturedExperiments } from "../components/home/FeaturedExperiments";
import { Hero } from "../components/home/Hero";
import { LearningTimeline } from "../components/home/LearningTimeline";
import { ProjectStrip } from "../components/home/ProjectStrip";
import { ProgressOverview } from "../components/home/ProgressOverview";

export function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-14 sm:px-6">
        <ProgressOverview />
        <ConceptPulse />
        <LearningTimeline />
        <FeaturedExperiments />
        <ProjectStrip />
      </div>
    </>
  );
}
