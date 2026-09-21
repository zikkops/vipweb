"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/components/dashboard/api";
import DailySheet from "@/components/dashboard/DailySheet";
import DueCalendar from "@/components/dashboard/DueCalendar";
import { useUser } from "@/components/dashboard/Session";
import TaskPanel from "@/components/dashboard/tasks/TaskPanel";
import { useTasks } from "@/components/dashboard/tasks/useTasks";
import { BUTTON, BUTTON_SOLID, INPUT, LABEL, PAGE_TITLE } from "@/components/dashboard/ui";
import { useTags } from "@/components/dashboard/useTags";
import type { Tag, TagKind, User } from "@/lib/dues";

const TABS = [
  { key: "sheet", label: "Daily sheet" },
  { key: "calendar", label: "Calendar" },
  { key: "tags", label: "Tags" },
  { key: "people", label: "People" },
] as const;

export default function AdminPage() {
  const user = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("sheet");
  const { tags, error: tagsError, reload: reloadTags } = useTags();
  const { tasks, error: tasksError, replace } = useTasks(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (user.role !== "admin") router.replace("/dashboard/");
  }, [user, router]);
  if (user.role !== "admin") return null;

  const people = [...new Map((tasks ?? []).map((t) => [t.userId, { id: t.userId, name: t.userName }])).values()].sort(
    (a, b) => a.name.localeCompare(b.name)
  );
  const open = (task: { id: number }) => setOpenId(task.id);

  return (
    <div>
      <h1 className={PAGE_TITLE}>
        Admin<span className="text-accent">_</span>
      </h1>

      <div
        role="tablist"
        className="mt-6 flex gap-6 overflow-x-auto [scrollbar-width:none] shadow-[inset_0_-1px_0_var(--color-hairline)]"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 pb-3 font-heading text-sm uppercase tracking-widest transition-colors ${
              tab === t.key ? "border-accent text-accent" : "border-transparent text-ink hover:text-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tagsError || tasksError) && <p className="mt-6 text-sm text-brand-coral">{tagsError || tasksError}</p>}

      <div className="mt-8">
        {!tags || !tasks ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : tab === "sheet" ? (
          <DailySheet tasks={tasks} tags={tags} onOpen={open} />
        ) : tab === "calendar" ? (
          <DueCalendar tasks={tasks} people={people} tags={tags} onOpen={open} />
        ) : tab === "tags" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <TagManager kind="brand" title="Brands" tags={tags.brands} onChanged={reloadTags} />
            <TagManager kind="section" title="Work sections" tags={tags.sections} onChanged={reloadTags} />
          </div>
        ) : (
          <PeopleTab me={user} />
        )}
      </div>

      {openId !== null && tags && (
        <TaskPanel
          taskId={openId}
          tags={tags}
          canEdit={(t) => t.userId === user.id}
          onClose={() => setOpenId(null)}
          onChanged={replace}
        />
      )}
    </div>
  );
}

// ---- tags ------------------------------------------------------------------

function TagManager({
  kind,
  title,
  tags,
  onChanged,
}: {
  kind: TagKind;
  title: string;
  tags: Tag[];
  onChanged: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [filter, setFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (fn: () => Promise<unknown>) => {
      setBusy(true);
      setError("");
      try {
        await fn();
        await onChanged();
        return true;
      } catch (err) {
        setError(errorMessage(err));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onChanged]
  );

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const added = await run(() => api("tags/", { method: "POST", body: { kind, name, code } }));
    if (added) {
      setName("");
      setCode("");
    }
  }

  const patch = (tag: Tag, body: Partial<Pick<Tag, "name" | "code" | "active">>) =>
    run(() => api(`tags/${kind}/${tag.id}/`, { method: "PATCH", body }));

  const q = filter.trim().toLowerCase();
  const visible = tags.filter(
    (t) => (showArchived || t.active) && (!q || t.name.toLowerCase().includes(q) || t.code?.toLowerCase().includes(q))
  );
  const archivedCount = tags.filter((t) => !t.active).length;

  return (
    <section className="border border-hairline bg-paper p-5 sm:p-6">
      <h2 className="font-heading text-2xl">
        {title} <span className="text-muted">({tags.filter((t) => t.active).length})</span>
      </h2>

      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label className={LABEL} htmlFor={`${kind}-name`}>
            New {kind === "brand" ? "brand" : "section"}
          </label>
          <input id={`${kind}-name`} className={INPUT} required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-28">
          <label className={LABEL} htmlFor={`${kind}-code`}>
            Code
          </label>
          <input
            id={`${kind}-code`}
            className={`${INPUT} uppercase`}
            placeholder={kind === "brand" ? "BDF" : "WEB"}
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <button type="submit" className={BUTTON_SOLID} disabled={busy}>
          Add
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <input
          aria-label={`Filter ${title.toLowerCase()}`}
          className={`${INPUT} max-w-60`}
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {archivedCount > 0 && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="accent-accent"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show archived ({archivedCount})
          </label>
        )}
      </div>

      <ul className="mt-4 max-h-[28rem] divide-y divide-hairline overflow-auto">
        {visible.map((tag) => (
          <TagRow key={tag.id} tag={tag} busy={busy} onPatch={(body) => patch(tag, body)} />
        ))}
        {visible.length === 0 && <li className="py-3 text-sm text-muted">Nothing here.</li>}
      </ul>
    </section>
  );
}

function TagRow({
  tag,
  busy,
  onPatch,
}: {
  tag: Tag;
  busy: boolean;
  onPatch: (body: Partial<Pick<Tag, "name" | "code" | "active">>) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [code, setCode] = useState(tag.code ?? "");

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 py-2">
        <input aria-label="Name" className={`${INPUT} min-w-40 flex-1`} value={name} onChange={(e) => setName(e.target.value)} />
        <input
          aria-label="Code"
          className={`${INPUT} w-24 uppercase`}
          maxLength={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className={BUTTON_SOLID}
          disabled={busy}
          onClick={async () => {
            if (await onPatch({ name, code })) setEditing(false);
          }}
        >
          Save
        </button>
        <button
          className={BUTTON}
          onClick={() => {
            setName(tag.name);
            setCode(tag.code ?? "");
            setEditing(false);
          }}
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className={`flex items-center gap-3 py-2 text-sm ${tag.active ? "" : "text-muted-light"}`}>
      <span className="flex-1">{tag.name}</span>
      <span className="w-16 font-heading text-xs tracking-widest text-muted">{tag.code ?? "—"}</span>
      <button className="text-muted hover:text-accent" onClick={() => setEditing(true)}>
        Edit
      </button>
      <button
        className="text-muted hover:text-accent disabled:opacity-40"
        disabled={busy}
        onClick={() => onPatch({ active: !tag.active })}
      >
        {tag.active ? "Archive" : "Restore"}
      </button>
    </li>
  );
}

// ---- people ----------------------------------------------------------------

function PeopleTab({ me }: { me: User }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setUsers((await api<{ users: User[] }>("admin/users/")).users);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    load();
  }, [load]);

  async function setRole(user: User, role: User["role"]) {
    setError("");
    try {
      await api(`admin/users/${user.id}/`, { method: "PATCH", body: { role } });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!users) return error ? <p className="text-sm text-brand-coral">{error}</p> : null;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-brand-coral">{error}</p>}
      <div className="overflow-x-auto border border-hairline bg-paper">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-heading text-xs uppercase tracking-widest text-muted">
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Joined</th>
              <th className="px-4 py-3 font-normal">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3">
                  {u.name}
                  {u.id === me.id && <span className="ml-2 text-muted">(you)</span>}
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-muted">{new Date(`${u.createdAt}Z`).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Role for ${u.name}`}
                    className={`${INPUT} w-auto`}
                    value={u.role}
                    onChange={(e) => setRole(u, e.target.value as User["role"])}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
