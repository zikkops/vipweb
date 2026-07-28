export default function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <div className="font-heading text-sm tracking-[0.3em] text-muted mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-4xl md:text-5xl">
        {title}
        <span className="text-muted-light">_</span>
      </h2>
    </div>
  );
}
