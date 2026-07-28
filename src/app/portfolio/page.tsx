import PortfolioGrid from "@/components/PortfolioGrid";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Portfolio — Boldlab",
};

export default function PortfolioPage() {
  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="font-heading text-sm tracking-[0.3em] text-muted mb-4">
            Portfolio
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Selected Work Across Brand, Web, And Advertising_
          </h1>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <PortfolioGrid />
      </section>
    </>
  );
}
