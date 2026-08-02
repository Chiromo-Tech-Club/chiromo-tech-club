import { z } from "zod";

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid("Invalid event."),
  memberId: z.string().uuid("Invalid member."),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;

/** Shape for creating/editing an event from the admin portal. */
export const eventInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(1000),
  startsAt: z.string().datetime({ message: "Provide a valid ISO date-time." }),
  endsAt: z.string().datetime().optional(),
  location: z.string().trim().min(2).max(160),
  capacity: z.number().int().positive().optional(),
});

export type EventInput = z.infer<typeof eventInputSchema>;
