/**
 * Thin wrapper around whatever transactional email provider gets chosen
 * (Resend, Postmark, SES...). Swapping providers later only touches this
 * file — actions/ and features/ never import a provider SDK directly.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Fail loud in production, but let local dev proceed without a provider configured.
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set.");
    }
    console.warn("[services/email] No email provider configured — logging instead of sending.", input);
    return { id: "dev-noop" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Chiromo Tech Club <hello@chiromotechclub.org>",
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export function sendNewsletterConfirmation(to: string) {
  return sendEmail({
    to,
    subject: "You're subscribed to Chiromo Tech Club",
    html: `<p>Thanks for subscribing — we'll send event announcements and project updates here.</p>`,
  });
}

export function sendEventReminder(to: string, eventTitle: string, whenLabel: string) {
  return sendEmail({
    to,
    subject: `Reminder: ${eventTitle}`,
    html: `<p>${eventTitle} is coming up ${whenLabel}. See you there.</p>`,
  });
}
