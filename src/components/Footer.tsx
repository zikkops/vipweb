import Link from "next/link";
import { nav, site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-page py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="font-heading text-2xl mb-4">
            {site.name}<span className="text-muted-light">_</span>
          </div>
          <p className="text-muted-light max-w-sm mb-6">{site.description}</p>
          <div className="flex gap-4">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="text-sm tracking-widest font-heading border border-white/20 px-3 py-1.5 hover:border-white transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-widest mb-4">Navigate</h4>
          <ul className="space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-light hover:text-paper transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm tracking-widest mb-4">Get In Touch</h4>
          <ul className="space-y-2 text-muted-light normal-case">
            <li><a href={`mailto:${site.email}`} className="hover:text-paper transition-colors">{site.email}</a></li>
            <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-paper transition-colors">{site.phone}</a></li>
            {site.addresses.map((a) => (
              <li key={a.label}>{a.line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs tracking-widest text-muted-light">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span>Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
