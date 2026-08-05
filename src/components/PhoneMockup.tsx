import Image from "next/image";

export default function PhoneMockup({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div className="relative w-full max-w-[600px] aspect-[16/9.2] rounded-[2.5rem] border-[10px] border-hairline bg-paper shadow-xl mx-auto">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-16 rounded-full bg-hairline" />

      <div className="relative w-full h-full rounded-[1.75rem] overflow-hidden bg-ink">
        <Image src={src} alt={alt} fill sizes="600px" className="object-cover" />
      </div>
    </div>
  );
}
