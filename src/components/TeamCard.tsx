import Image from "next/image";
import type { TeamMember } from "@/data/team";

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="group">
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-ink">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
        />
      </div>
      <div className="text-sm text-muted mb-1">{member.role}</div>
      <h3 className="font-heading text-2xl">{member.name}</h3>
      <p className="text-muted mt-2 text-sm">{member.bio}</p>
    </div>
  );
}
