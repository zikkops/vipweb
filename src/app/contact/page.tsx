import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";

export const metadata = {
  title: "Contact Us — VIPMINDS",
};

export default function ContactPage() {
  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="font-heading text-sm tracking-[0.3em] text-muted mb-4">
            Contact Us
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Don&apos;t Be Shy, Say Hello!_
          </h1>
        </Reveal>
      </section>

      <section className="container-page pb-16">
        <Reveal>
          <div className="relative aspect-[21/9] overflow-hidden">
            <Image
              src="/images/misc/contact.jpg"
              alt="VIPMINDS office"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28 grid grid-cols-1 md:grid-cols-3 gap-12">
        <Reveal className="md:col-span-2 block">
          <ContactForm />
        </Reveal>

        <Reveal delay={0.15} className="space-y-10 block">
          <div>
            <h3 className="text-sm tracking-widest text-muted mb-2">Email Us</h3>
            <a href={`mailto:${site.email}`} className="font-heading text-xl">
              {site.email}
            </a>
          </div>
          {site.addresses.map((a) => (
            <div key={a.label}>
              <h3 className="text-sm tracking-widest text-muted mb-2">{a.label}</h3>
              <p className="font-heading text-xl mb-2">{a.line}</p>
              <a
                href={`tel:${a.phone.replace(/[\s-]/g, "")}`}
                className="font-heading text-xl hover:text-muted transition-colors"
              >
                {a.phone}
              </a>
            </div>
          ))}
        </Reveal>
      </section>
    </>
  );
}
