export default function SectionHeading({
  eyebrow,
  title,
  align = "left",
  underscoreClassName = "text-muted-light",
  titleClassName = "text-4xl md:text-5xl",
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  underscoreClassName?: string;
  titleClassName?: string;
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <div className="text-sm text-muted mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className={titleClassName}>
        {title}
        <span className={underscoreClassName}>_</span>
      </h2>
    </div>
  );
}
