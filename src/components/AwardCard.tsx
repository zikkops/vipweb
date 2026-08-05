type Award = { title: string; subtitle: string; description: string };

export default function AwardCard({ award }: { award: Award }) {
  return (
    <div>
      <h3 className="font-heading font-semibold text-[26px] leading-snug">{award.title}</h3>
      <p className="text-muted text-[16px] mt-4 normal-case max-w-sm">{award.description}</p>
    </div>
  );
}
