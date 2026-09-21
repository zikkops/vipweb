"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { Tag } from "@/lib/dues";
import { INPUT } from "./ui";

/**
 * Searchable single-select dropdown for brands and work sections. Archived
 * tags are hidden from the list but still display if a saved row uses one.
 */
export default function Combobox({
  label,
  tags,
  value,
  onChange,
  placeholder = "Search…",
}: {
  label: string;
  tags: Tag[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = tags.find((t) => t.id === value);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags.filter(
      (t) => t.active && (!q || t.name.toLowerCase().includes(q) || t.code?.toLowerCase().includes(q))
    );
  }, [tags, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(tag: Tag) {
    onChange(tag.id);
    close();
  }

  function move(delta: number) {
    if (!options.length) return;
    const next = (highlight + delta + options.length) % options.length;
    setHighlight(next);
    listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && options[highlight] ? `${id}-${options[highlight].id}` : undefined}
        aria-autocomplete="list"
        className={INPUT}
        placeholder={open && selected ? selected.name : placeholder}
        value={open ? query : (selected?.name ?? "")}
        onFocus={() => {
          setOpen(true);
          setHighlight(0);
        }}
        onBlur={close}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (open) move(1);
            else setOpen(true);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter" && open) {
            e.preventDefault();
            if (options[highlight]) choose(options[highlight]);
          } else if (e.key === "Escape") {
            close();
          }
        }}
      />
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 min-w-48 overflow-auto border border-hairline bg-paper shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">No matches — ask an admin to add it.</li>
          ) : (
            options.map((tag, i) => (
              <li
                key={tag.id}
                id={`${id}-${tag.id}`}
                role="option"
                aria-selected={tag.id === value}
                // mousedown so the choice lands before the input's blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(tag);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                  i === highlight ? "bg-surface" : ""
                } ${tag.id === value ? "text-accent" : ""}`}
              >
                <span>{tag.name}</span>
                {tag.code && <span className="font-heading text-xs tracking-widest text-muted">{tag.code}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
