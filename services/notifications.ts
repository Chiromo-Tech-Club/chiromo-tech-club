/**
 * Placeholder for push notification dispatch (see the "Future Expansion"
 * list: Push Notifications, PWA). Kept as a real module with a typed
 * interface now so features/ can call it today and get a working no-op,
 * rather than being wired up retroactively once a provider is chosen.
 */
export interface PushNotificationInput {
  memberId: string;
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(input: PushNotificationInput): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info("[services/notifications] (noop, not yet configured):", input);
    return;
  }
  // Wire up a real provider (e.g. web-push, OneSignal, Firebase) here.
  throw new Error("Push notifications are not configured yet.");
}
