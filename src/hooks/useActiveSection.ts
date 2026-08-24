"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which in-page section is currently in view so the nav can highlight it.
 * Returns the id of the section nearest the top of the viewport, or "" when none
 * of them are on the page (i.e. on a route other than the one-pager).
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const pick = () => {
      // the last section whose top has passed the header line is the current one
      let current = sections[0].id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      }
      setActive(current);
    };

    // defer the first read so we never set state synchronously inside the effect
    const raf = requestAnimationFrame(pick);
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [ids]);

  return active;
}
