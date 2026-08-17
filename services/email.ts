/**
 * Thin wrapper around EmailJS. Swapping providers later only touches this
 * file — actions/ and features/ never import the provider SDK directly.
 *
 * IMPORTANT — EmailJS is template-based, not raw-HTML-based like the old
 * Resend version was. Each call sends a set of named *variables* into a
 * template you build in the EmailJS dashboard, rather than an HTML string
 * built in code. That means the actual subject line, layout, and copy now
 * live in EmailJS's dashboard, not in this file — the `templateParams`
 * objects below are just the blanks each template needs filled in.
 *
 * One-time account setup required (see the step-by-step separately):
 * - An Email Service connected (Gmail/Outlook/custom SMTP)
 * - Two templates created: one for newsletter confirmation, one for event
 *   reminders — each with a "To Email" field set to {{to_email}} in the
 *   template settings, and body variables matching what's sent below
 * - "Allow EmailJS API for non-browser applications" enabled under
 *   Account → Security (off by default, and required for server-side use)
 */
import emailjs from "@emailjs/nodejs";

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const TEMPLATE_NEWSLETTER = process.env.EMAILJS_TEMPLATE_NEWSLETTER;
const TEMPLATE_EVENT_REMINDER = process.env.EMAILJS_TEMPLATE_EVENT_REMINDER;

const isConfigured = Boolean(SERVICE_ID && PUBLIC_KEY && PRIVATE_KEY);

if (isConfigured) {
  emailjs.init({ publicKey: PUBLIC_KEY!, privateKey: PRIVATE_KEY! });
}

async function sendTemplate(
  templateId: string | undefined,
  templateParams: Record<string, string>,
): Promise<{ id: string }> {
  if (!isConfigured || !templateId) {
    // Fail loud in production, but let local dev proceed without a provider configured.
    if (process.env.NODE_ENV === "production") {
      throw new Error("EmailJS env vars are not fully set (SERVICE_ID / PUBLIC_KEY / PRIVATE_KEY / template id).");
    }
    console.warn("[services/email] No email provider configured — logging instead of sending.", {
      templateId,
      templateParams,
    });
    return { id: "dev-noop" };
  }

  try {
    const res = await emailjs.send(SERVICE_ID!, templateId, templateParams);
    return { id: String(res.status) };
  } catch (err) {
    throw new Error(`Failed to send email: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function sendNewsletterConfirmation(to: string, name: string) {
  return sendTemplate(TEMPLATE_NEWSLETTER, {
    to_email: to,
    name,
  });
}

export function sendEventReminder(to: string, eventTitle: string, whenLabel: string) {
  return sendTemplate(TEMPLATE_EVENT_REMINDER, {
    to_email: to,
    event_title: eventTitle,
    when_label: whenLabel,
  });
}