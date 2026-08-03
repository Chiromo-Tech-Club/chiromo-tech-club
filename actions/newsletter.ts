"use server";

import { z } from "zod";
import { sendNewsletterConfirmation } from "../services/email";
import type { ActionResult } from "../actions/membership";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export async function subscribeToNewsletter(formData: FormData): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  try {
    // TODO: persist to a `newsletter_subscribers` table once that's added
    // to lib/drizzle/schema.ts — for now this only sends the confirmation.
    await sendNewsletterConfirmation(parsed.data.email);
    return { success: true };
  } catch (err) {
    console.error("subscribeToNewsletter failed:", err);
    return { success: false, error: "Could not subscribe right now. Please try again." };
  }
}