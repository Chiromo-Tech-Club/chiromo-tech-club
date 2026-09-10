/**
 * Thin wrapper around EmailJS. Swapping providers later only touches this
 * file — actions/ and features/ never import the provider SDK directly.
 *
 * IMPORTANT — EmailJS is template-based. In the EmailJS dashboard each
 * template's "To Email" MUST be set to {{to_email}} (not a personal Gmail).
 * "Reply To" should use {{reply_to}} so replies go to the club inbox.
 *
 * One-time account setup:
 * - Email Service connected (prefer club Gmail: ctc.uonbi@gmail.com)
 * - Templates with To = {{to_email}}, Reply-To = {{reply_to}}
 * - "Allow EmailJS API for non-browser applications" enabled
 */
import emailjs from "@emailjs/nodejs";
import { SITE_CONFIG } from "@/config/site";

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const TEMPLATE_NEWSLETTER = process.env.EMAILJS_TEMPLATE_NEWSLETTER;
const TEMPLATE_EVENT_REMINDER = process.env.EMAILJS_TEMPLATE_EVENT_REMINDER;

const CLUB_EMAIL = process.env.EMAILJS_REPLY_TO?.trim() || SITE_CONFIG.contactEmail;
const CLUB_FROM_NAME = SITE_CONFIG.name;

const isConfigured = Boolean(SERVICE_ID && PUBLIC_KEY && PRIVATE_KEY);

if (isConfigured) {
  emailjs.init({ publicKey: PUBLIC_KEY!, privateKey: PRIVATE_KEY! });
}

async function sendTemplate(
  templateId: string | undefined,
  templateParams: Record<string, string>,
): Promise<{ id: string }> {
  if (!isConfigured || !templateId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "EmailJS env vars are not fully set (SERVICE_ID / PUBLIC_KEY / PRIVATE_KEY / template id).",
      );
    }
    console.warn("[services/email] No email provider configured — logging instead of sending.", {
      templateId,
      templateParams,
    });
    return { id: "dev-noop" };
  }

  const params = {
    ...templateParams,
    // Always club-owned — never the personal account used to set up EmailJS
    reply_to: templateParams.reply_to || CLUB_EMAIL,
    from_name: templateParams.from_name || CLUB_FROM_NAME,
    club_email: CLUB_EMAIL,
  };

  try {
    const res = await emailjs.send(SERVICE_ID!, templateId, params);
    return { id: String(res.status) };
  } catch (err) {
    throw new Error(`Failed to send email: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function sendNewsletterConfirmation(to: string, name: string) {
  return sendTemplate(TEMPLATE_NEWSLETTER, {
    to_email: to,
    name,
    reply_to: CLUB_EMAIL,
    from_name: CLUB_FROM_NAME,
  });
}

export function sendEventReminder(to: string, eventTitle: string, whenLabel: string) {
  return sendTemplate(TEMPLATE_EVENT_REMINDER, {
    to_email: to,
    event_title: eventTitle,
    when_label: whenLabel,
    reply_to: CLUB_EMAIL,
    from_name: CLUB_FROM_NAME,
  });
}
