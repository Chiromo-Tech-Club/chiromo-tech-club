import { getSupabaseServiceClient } from "@/lib/supabase/client";
import { LIMITS } from "@/constants/limits";

/**
 * Bucket layout (create these in Supabase Storage before using this module):
 * - "avatars"        public=false, path: {memberId}/{filename}
 * - "project-media"  public=true,  path: {projectSlug}/{filename}
 * - "event-covers"   public=true,  path: {eventSlug}/{filename}
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

/** Uploads to the private avatars bucket and returns a time-limited signed URL. */
export async function uploadPrivateAvatar(memberId: string, file: File): Promise<UploadResult> {
  assertValidImage(file);
  const supabase = getSupabaseServiceClient();
  const path = `${memberId}/${file.name}`;

  const { error } = await supabase.storage.from(BUCKETS.avatars).upload(path, file, { upsert: true });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(BUCKETS.avatars)
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (signError) throw signError;

  return { path, publicUrl: data.signedUrl };
}
