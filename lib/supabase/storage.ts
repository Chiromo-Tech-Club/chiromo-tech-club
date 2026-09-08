import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { LIMITS } from "@/constants/limits";

/**
 * Bucket layout (create these in Supabase Storage before using this module):
 * - "avatars"        public=true (recommended), path: {memberId}/avatar.{ext}
 * - "project-media"  public=true,  path: {projectSlug}/{filename}
 * - "event-covers"   public=true,  path: {eventSlug}/{filename}
 *
 * If "avatars" is private, getPublicUrl still returns a URL that only works
 * when the bucket policies allow public read — make the bucket public for
 * membership cards and nav avatars to keep working.
 */
export const BUCKETS = {
  avatars: "avatars",
  projectMedia: "project-media",
  eventCovers: "event-covers",
} as const;

export interface UploadResult {
  path: string;
  publicUrl: string | null;
}

function assertValidImage(file: { type: string; size: number }) {
  if (!(LIMITS.allowedImageTypes as readonly string[]).includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > LIMITS.maxUploadBytes) {
    throw new Error(`File exceeds max upload size of ${LIMITS.maxUploadBytes / (1024 * 1024)}MB.`);
  }
}

/** Uploads to a public bucket (project-media, event-covers) and returns its public URL. */
export async function uploadPublicImage(
  bucket: (typeof BUCKETS)["projectMedia"] | (typeof BUCKETS)["eventCovers"],
  path: string,
  file: File,
): Promise<UploadResult> {
  assertValidImage(file);
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Uploads a member avatar and returns a stable public URL (cache-busted path). */
export async function uploadPrivateAvatar(memberId: string, file: File): Promise<UploadResult> {
  assertValidImage(file);
  const supabase = getSupabaseServiceClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${memberId}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKETS.avatars).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKETS.avatars).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
