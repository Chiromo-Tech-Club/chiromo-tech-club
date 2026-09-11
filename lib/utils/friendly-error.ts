/**
 * Maps raw auth / API error text into short messages members can act on.
 * Never surface stack traces, SQL codes, or vendor jargon in the UI.
 */
export function friendlyAuthError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = msg.toLowerCase();

  if (!msg.trim()) return fallback;

  if (/invalid login credentials|invalid_credentials|wrong password|user not found/i.test(msg)) {
    return "Email or password is incorrect. Please try again.";
  }
  if (/email not confirmed|not confirmed/i.test(msg)) {
    return "Please confirm your email before signing in. Check your inbox for the link.";
  }
  if (/already registered|already been registered|user already|email.*exists/i.test(msg)) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (/password.*(weak|least|characters|short)/i.test(msg) || /weak_password/i.test(msg)) {
    return "Please choose a stronger password (at least 8 characters).";
  }
  if (/rate limit|too many requests|over_request/i.test(msg)) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (/network|fetch failed|failed to fetch|offline|timeout/i.test(msg)) {
    return "Connection problem. Check your internet and try again.";
  }
  if (/popup|blocked|window/i.test(msg)) {
    return "Pop-up was blocked. Allow pop-ups for this site and try again.";
  }
  if (/oauth|provider|google/i.test(msg) && /error|fail|denied|cancel/i.test(msg)) {
    return "Google sign-in didn’t complete. Please try again.";
  }
  if (/column .* does not exist|42703|duplicate key|23505|foreign key|23503/i.test(msg)) {
    return "We couldn’t save your details right now. Please try again in a moment.";
  }
  // If it still looks like a raw technical string, hide it.
  if (
    /stack|exception|sql|drizzle|postgres|supabase|undefined|null is not|cannot read|econnrefused|status code/i.test(
      lower,
    )
  ) {
    return fallback;
  }

  // Short, plain messages from our own code can pass through.
  if (msg.length <= 120 && !/[{}[\]`]/.test(msg) && !/^\w+Error:/i.test(msg)) {
    return msg;
  }

  return fallback;
}
