"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faXTwitter, faBehance, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import { faLocationDot, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { site } from "@/data/site";
import { posts } from "@/data/blog";

const socialIcons: Record<string, IconDefinition> = {
  Instagram: faInstagram,
  Twitter: faXTwitter,
  Behance: faBehance,
  Facebook: faFacebookF,
};

const instaImages = [
  "/images/portfolio/make-things-happen.jpg",
  "/images/portfolio/life-in-every-stitch.jpg",
  "/images/portfolio/our-passion.jpg",
  "/images/portfolio/beauty-you-can-afford.jpg",
  "/images/portfolio/natural-beauty.jpg",
  "/images/portfolio/start-with-trust.jpg",
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-page py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h4 className="text-[26px] mb-6">About Us</h4>
          <p className="text-paper normal-case mb-6 max-w-xs">{site.description}</p>
          <div className="space-y-2 text-muted-light normal-case mb-6">
            {site.addresses[0] && (
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 shrink-0" />
                <span>{site.addresses[0].line}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 shrink-0" />
              <span>{site.email}</span>
            </div>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex max-w-xs">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full bg-white/10 text-paper placeholder-muted-light px-4 py-3 outline-none focus:bg-white/15 transition-colors"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="shrink-0 w-12 flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>
        </div>

        <div>
          <h4 className="text-[26px] mb-6">Latest News</h4>
          <div className="space-y-6">
            {posts.slice(0, 2).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <div className="text-xs text-muted-light normal-case mb-1">
                  {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="normal-case group-hover:text-muted-light transition-colors">{post.title}</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[26px] mb-6">Instagram</h4>
          <div className="grid grid-cols-3 gap-2">
            {instaImages.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden">
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a]">
        <div className="container-page py-6 flex items-center justify-between">
          <Image src="/images/logo-mark.svg" alt={site.name} width={40} height={40} className="w-10 h-10" />

          <div className="flex items-center gap-3">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center bg-paper text-ink hover:bg-muted-light transition-colors"
              >
                <FontAwesomeIcon icon={socialIcons[s.label]} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
