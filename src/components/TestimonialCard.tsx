export default function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="border border-hairline p-8 h-full flex flex-col">
      <p className="font-heading text-xl md:text-2xl leading-snug mb-6 flex-1">
        &ldquo;{quote}&rdquo;
      </p>
      <div>
        <div className="font-heading tracking-widest text-sm">{name}</div>
        <div className="text-muted text-sm">{role}</div>
      </div>
    </div>
  );
}
