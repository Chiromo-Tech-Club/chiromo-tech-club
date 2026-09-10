import { uploadPublicImage, uploadPrivateAvatar, uploadPublicDocument, BUCKETS } from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils/slugify";

/**
 * The reusable upload pipeline actions/ calls into. lib/supabase/storage
 * handles the raw Supabase calls; this file adds the app-specific rules
 * (path naming, which bucket a given upload kind belongs in).
 */

export async function uploadProjectCover(projectSlug: string, file: File) {
  const path = `${projectSlug}/${Date.now()}-${slugify(file.name)}`;
  return uploadPublicImage(BUCKETS.projectMedia, path, file);
}

export async function uploadEventCover(eventSlug: string, file: File) {
  const path = `${eventSlug}/${Date.now()}-${slugify(file.name)}`;
  return uploadPublicImage(BUCKETS.eventCovers, path, file);
}

export async function uploadMemberAvatar(memberId: string, file: File) {
  return uploadPrivateAvatar(memberId, file);
}

export async function uploadClubDocument(memberId: string, file: File) {
  const safeName = slugify(file.name) || "document";
  const path = `${memberId}/${Date.now()}-${safeName}`;
  return uploadPublicDocument(path, file);
}
