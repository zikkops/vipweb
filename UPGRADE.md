# Upgrade plan

A checklist of upgrade tasks for the VIPMINDS site and the daily-dues dashboard.
Each task fits in one working session and ends with something you can check.
Tasks are ordered by risk, safest first: do them top to bottom, and commit after each one.

**Before and after every task, run:**

```bash
npm run check
```

It typechecks, lints and builds, then confirms `out/` holds only the public pages (4 since task 12: home, two 404 copies, `_not-found`) and **no** `out/dashboard` or `out/api`.

---

## Audit summary (2026-09-21)

| Area | Finding |
| --- | --- |
| Git | The whole dashboard (API, pages, `src/lib/server`, the `(site)` route-group move, `next.config.ts`, the `@types/node` bump) is **uncommitted**. One bad `git checkout` would lose it. |
| Security | `npm audit`: 6 vulnerabilities (1 critical, 5 high). The critical ones are in **Next 16.2.12**, including a remote-code-execution bug on Windows-hosted servers. The live site is a static export, so Hostinger isn't exposed. The risk is the local `next dev` server, which listens on your whole network (`http://192.168.x.x:3000`). |
| Website | The contact forms on the home and contact pages show "Message Sent" but **send nothing**. Every enquiry is lost. |
| Website | Placeholder content is live: the stats (Employees 42, Designers 18, Projects 260, Happy Clients 120) and the social links in `src/data/site.ts` (they point to the Instagram, Twitter, Behance and Facebook home pages). |
| Website | The template's inner pages (`/about`, `/blog`, `/team`, `/services`, `/portfolio` + details) are still built and public, but nothing links to them. They still hold template content. |
| Dead weight | `public/videos/` (14 MB, 3 files) isn't referenced anywhere but is deployed on every push. Unused components: `AutoplayVideo`, `AwardCard`, `NewsCard`, `PhoneMockup`, `PlaceholderMedia`, `RotatingIcon`, `TeamShowcase`, `TestimonialCard`. Unused data file: `src/data/awards.ts`. |
| Lint | 1 error: `src/components/ClientsLogoGrid.tsx:15` calls `setState` directly inside an effect. |
| Dashboard | It's built on daily snapshots: every day each person re-files all their rows, and "Carry over" copies them. Status depends on which section a row was filed in. Deleting a row makes it vanish instead of recording it as done. Blocking has no reason, date or unblock step. **Tasks 13–22 replace this with persistent tasks** (what you asked for). |
| Dashboard | It runs only under `next dev`, uses `node:sqlite` (experimental in Node 22), and has no login rate-limit, password reset or email confirmation. That's fine for local testing, but it has to be fixed before going online (tasks 23–27). |
| Dependencies | Major versions available but **deliberately deferred**: TypeScript 7, ESLint 10, framer-motion 13, `@types/node` 26. |

---

## Phase 0 — Safety net (no behavior change)

- [x] **1. Commit the dashboard work on a branch, not `main`.**
  `main` auto-deploys to Hostinger. Create `dashboard`, commit everything currently uncommitted, and push that branch.
  *Done when:* `git status` is clean and `main` is untouched.

- [x] **2. Add a `npm run check` script.**
  One command that runs typecheck, lint and build, then fails if `out/` doesn't have exactly 25 HTML pages or contains `dashboard/` or `api/`.
  Use a small Node script in `scripts/`, with no new dependencies.
  *Done when:* `npm run check` passes, and fails when you temporarily rename `page.dev.tsx` → `page.tsx`.

## Phase 1 — Low-risk cleanup

- [x] **3. Stop the dev server from listening on your network.**
  Change the `dev` script to `next dev -H localhost` until Next is upgraded (task 7) and the dashboard goes online properly.
  *Done when:* the `dev` banner shows no "Network:" URL.

- [x] **4. Fix the lint error in `ClientsLogoGrid.tsx`.**
  Compute the random delays and the shuffled order once, in a lazy `useState` initializer or `useMemo`, instead of in `useEffect`. The logos must still fade in at random.
  *Done when:* `npx eslint .` shows 0 errors, and the logo wall still animates.

- [x] **5. Delete unused components and data.**
  Delete `AutoplayVideo`, `AwardCard`, `NewsCard`, `PhoneMockup`, `PlaceholderMedia`, `RotatingIcon`, `TeamShowcase`, `TestimonialCard` and `src/data/awards.ts`.
  Re-check each one with a search for its name first.
  *Done when:* `npm run check` passes.

- [x] **6. Delete `public/videos/`.**
  Nothing references it: `hero-wave.mp4`, `beirut-duty-free-film.mp4` and `generic-showcase.mp4` (14 MB).
  Keep a copy outside the repo if you might reuse the films.
  *Done when:* the `out/` size drops by about 14 MB and the site looks the same.

## Phase 2 — Dependency patches

- [x] **7. Upgrade Next 16.2.12 → 16.3.x and `eslint-config-next` to match.**
  This closes the critical advisories. Keep the version pinned exactly, the way `package.json` already does.
  Re-test: the home page, the mobile menu, the static export page count, and the dashboard under `next dev` (sign in, save).
  *Done when:* `npm audit` no longer lists `next`.

- [x] **8. Run `npm audit fix` (not `--force`).**
  This patches the dev-only tools `brace-expansion`, `js-yaml` and `nanoid`.
  Then run `npm audit` again. If `sharp` or `postcss` are still flagged, check whether they only come in through Next, and take the fix Next ships rather than forcing it.
  *Done when:* only the findings you've written down as accepted remain.

- [x] **9. Upgrade React 19.2 → 19.3, plus `@types/react` and `@types/react-dom`.**
  This is a minor version bump.
  *Done when:* `npm run check` passes, and the preloader, menu and lightbox all still work.

- [x] **10. Bump `@types/node` to the latest 22.x patch.**
  Stay on 22, which matches Hostinger.

## Phase 3 — Website content (each needs input from you)

- [ ] **11. Make the contact forms actually send.**
  > **Status (2026-09-21): code done, waiting on a form service.** The contact and newsletter forms post JSON to `NEXT_PUBLIC_FORM_ENDPOINT` (set it in Hostinger’s build environment), show a real error when that fails, and have a honeypot. With no endpoint set they open the visitor’s email app addressed to `marketing@vipminds.com` instead of pretending to send. Tested against a local mock endpoint (delivered, error, fallback). **Left to do:** create the Formspree/Web3Forms form (or PHP mailer), set the variable, redeploy, send a test message.
  The site is static, so it needs a form service. Two options:
  - a hosted endpoint such as Formspree or Web3Forms (a free tier is enough)
  - a small PHP mailer on Hostinger

  Send to `marketing@vipminds.com`. Show a real error if sending fails, and add a honeypot field against spam.
  **Needs:** your choice of service.
  *Done when:* a test message arrives in the inbox.

- [x] **12. Replace the placeholder stats and social links, and decide what happens to the inner pages.**
  **Needs:**
  - real numbers for the stats
  - real Instagram, Behance and LinkedIn URLs (or remove the socials)
  - a yes or no on deleting the unlinked template pages (`/about`, `/blog`, `/team`, `/services`, `/portfolio`)

  If they stay, mark them `noindex` until they have real content.
  *Done when:* no template text or placeholder numbers are publicly reachable.
  > **Done 2026-09-21:** the stats section is hidden until real figures go in `src/data/stats.ts`; the unused placeholder socials are gone; `/about`, `/blog`, `/team`, `/services`, `/portfolio` and the duplicate `/contact` page were deleted with everything only they used (restore from git history if wanted; unused images and videos are archived in `../vipweb-archive/`).

## Phase 4 — Dashboard: tasks instead of daily reports (your task list)

You asked for four things:

1. Add a task once, and it files itself as overdue, due today or coming up.
2. Click a task to mark it done or blocked.
3. A blocked task needs a reason and the date it became blocked, plus a **Received** tick that unblocks it.
4. See the job code change while working on the task.

**The idea:** a task is saved once and lives until it's done. Nobody picks a section any more. Status is calculated every time the task is shown:

| Status | Rule |
| --- | --- |
| **Done** | It has been marked done. |
| **Blocked** | It has a block with no **Received** tick yet. |
| **Overdue** | Its due date is before today. |
| **Due today** | Its due date is today. |
| **Coming up** | Its due date is after today, or it has no due date. |

Every change (created, due date moved, blocked, received, done, reopened) is written to a history log. That log gives admins the "new date and why" trail from your original sheet.

The Asana question ("Board matches this table: yes/no, what you fixed") becomes a short daily check-in, separate from tasks.

- [x] **13. Add the new tables next to the old ones (schema v3). Nothing is deleted yet.**
  - `tasks`: id, user_id, brand_id, section_id, title, due_date, job_code, done_at, created_at, updated_at
  - `task_blocks`: id, task_id, reason, waiting_on, blocked_on (date), received_at (null until ticked)
  - `task_events`: id, task_id, user_id, type, from/to values, note, at
  - `checkins`: user_id, date, asana_matches, asana_fix_note (unique per user and day)

  *Done when:* an existing `data/dues.sqlite` upgrades cleanly and the current dashboard still works.

- [x] **14. Write the status rule as one small function, and test it.**
  `taskStatus(task, openBlock, today)` goes in `src/lib/tasks.ts`, shared by the server and the pages.
  Add tests with Node's built-in test runner (`node --test`, no new dependencies). They should cover each status, the no-due-date case, a task that is both blocked and past due, and a date change at midnight.
  *Done when:* the tests pass.

- [x] **15. Build the task API (still dev-only).**
  Endpoints for: create a task, list my tasks, edit a task, mark done, reopen, block (reason required, blocked date defaults to today), and **Received** (unblocks the task).
  Each change writes a `task_events` row.
  Employees can only touch their own tasks; admins can read everyone's.
  *Done when:* each endpoint has been exercised with curl, including the permission checks.

- [x] **16. Build the "My tasks" page. It replaces the daily report editor.**
  - At the top, a one-line **quick add**: brand (searchable), work section (searchable), task, due date, and the live job code. Press Enter to add.
  - Below it, the tasks group themselves automatically into **Overdue → Due today → Blocked → Coming up**, with a collapsed **Done (last 7 days)** list.
  - Each task shows a coloured status dot, "2 days late" or "in 3 days", and its job code.

  *Done when:* a task you add with yesterday's date appears under Overdue with no other input, and moves to Due today if you change its date to today.

- [x] **17. Build the task panel: click a task to act on it.**
  - Clicking a task opens a side panel with **Mark done**, **Blocked**, **Edit** and the task's history.
  - **Blocked** asks for a reason (required), what or who it's waiting on (for example "Images from designer"), and the date it became blocked (defaults to today).
  - While blocked, the panel shows the reason and "Blocked for 3 days", with a **Received** tick. Ticking it unblocks the task and it drops back into its date group.
  - **Mark done** can be undone by reopening the task.

  *Done when:* you can go block → received → done on one task, and all three steps show in its history.

- [x] **18. Ask for a reason when a late due date moves.**
  If a task is overdue and its due date is moved later, ask "Why?" and save the reason in the history log.
  This keeps the "new date and why" column from your original sheet.
  *Done when:* the admin can see the old date, the new date and the reason.

- [x] **19. Add the daily check-in.**
  A small card at the top of My tasks: "Asana board matches my tasks: yes / no". If no, it asks what you fixed this morning. It's answered once a day.
  Admins see who has checked in today and who hasn't.
  *Done when:* the admin daily sheet lists missing check-ins.

- [x] **20. Show the job code live.**
  **Needs:** your job code rules.
  The existing codes (`EVC-0326-WEB-Website`, `BDF-0926-EVENT-Event Kit`, `NTR-0426-CRV-Branding`) suggest *brand code – MMYY – section code – section name*. Confirm or correct this before building.
  - Implement the rule in `src/lib/jobCode.ts`, with tests.
  - The quick-add row and the task panel recalculate the code on every change to brand, section or date, and highlight it when it changes ("BDF-0926-WEB → BDF-0926-EVENT").
  - The code is saved on the task, and any later change is recorded in its history.
  - Brands or sections without a code show which code is missing instead of "Auto".
  > **Done 2026-09-21, on an assumed rule:** `src/lib/jobCode.ts` uses the pattern above, with MMYY = the month the task was opened, and it’s covered by tests. **Please confirm or correct the rule.** Only that one file changes if it’s wrong.

  *Done when:* changing the section in the panel visibly updates the code, and the history records it.

- [x] **21. Point the admin daily sheet and calendar at tasks.**
  Same colours and filters as now, but read directly from `tasks` (this removes the "latest report" guesswork).
  Blocked tasks show their reason, what they're waiting on and how many days they've been blocked. Add a **Blocked** filter so admins can chase what's waiting on whom.
  *Done when:* the sheet and calendar match the My tasks page for the same person.

- [x] **22. Move the old report data into tasks, then retire the old report screens.**
  Write a one-time script that turns each person's latest report rows into tasks (rows ticked done become done tasks).
  Then remove the report editor, Carry over, the history page and the old report API and tables (schema v4).
  *Done when:* the dashboard has no report screens left and `npm run check` passes.
  > **Done 2026-09-21:** schema v4 migration converts each person’s latest report on first start, then drops `reports`/`report_items`. The report editor, Carry over, History page, report API and admin Reports tab are gone; the nav is now My tasks / Admin.

## Phase 5 — Going online (highest risk, do last)

- [ ] **23. Harden sign-in before exposing anything.**
  - Rate-limit logins (for example 5 attempts per 15 minutes per email and per IP).
  - Add a password reset (it can be admin-issued at first).
  - Let admins deactivate an account (a person who leaves the company).
  - Show when an admin's own role changed without needing a reload.

- [ ] **24. Recreate the schema in Supabase.**
  Tables as in Phase 4, with row-level security: employees can only read and write their own tasks, and admins can read everything. Test the security rules with two test users.

- [ ] **25. Switch sign-in to Supabase Auth.**
  Use email confirmation, and allow only `@vipminds.com` addresses plus the ones listed in `EXTRA_ALLOWED_EMAILS`. Remove the local session code.

- [ ] **26. Deploy the dashboard as its own app on a subdomain** (for example `team.vipminds.com`).
  The marketing site stays a static export on Hostinger and never includes the dashboard.
  Remove the `*.dev.tsx` split from the marketing repo once the dashboard lives elsewhere.

- [ ] **27. Backups and monitoring.**
  Turn on Supabase daily backups, test restoring once, and set up an alert when sign-in or save errors spike.

---

### Deferred on purpose

TypeScript 7, ESLint 10, framer-motion 13 and `@types/node` 26 are major version jumps with little benefit for this site right now.
Revisit them after Phase 5, one per session.
