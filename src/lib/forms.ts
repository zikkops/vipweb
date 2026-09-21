import { site } from "@/data/site";

/**
 * Where the site's forms deliver.
 *
 * The site is a static export, so a form needs a hosted endpoint to post to
 * (Formspree, Web3Forms, a Hostinger PHP mailer…). Set
 * NEXT_PUBLIC_FORM_ENDPOINT at build time to its URL; it receives a JSON POST.
 * Until one is configured, forms fall back to opening the visitor's email app
 * with the message addressed to the shared inbox, so nothing is silently lost.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

/** Name of the hidden field bots fill in and people never see. */
export const HONEYPOT = "company_website";

export type FormResult = "sent" | "mail-app";

export async function submitForm(
  subject: string,
  fields: Record<string, string>,
  honeypot: string
): Promise<FormResult> {
  // Pretend success to bots so they don't retry.
  if (honeypot) return "sent";

  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ subject, ...fields }),
    });
    if (!res.ok) throw new Error(`The form service answered ${res.status}.`);
    return "sent";
  }

  const body = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n\n");
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mail-app";
}
