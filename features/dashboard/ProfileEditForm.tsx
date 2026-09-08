"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, Loader2, ArrowLeft, AtSign, User } from "lucide-react";
import { updateMyProfile } from "@/actions/profile";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { ROUTES } from "@/constants/routes";

export interface ProfileFormMember {
  fullName: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  githubHandle?: string | null;
  phoneNumber?: string | null;
  course?: string | null;
  yearOfStudy?: string | null;
  campus?: string | null;
}

const YEAR_OPTIONS = [
  "Year 1 (Freshman)",
  "Year 2 (Sophomore)",
  "Year 3 (Junior)",
  "Year 4 (Senior)",
  "Postgraduate / Masters",
  "Alumni / Professional",
];

export function ProfileEditForm({ member }: { member: ProfileFormMember }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(member.avatarUrl ?? null);
  const [fullName, setFullName] = useState(member.fullName);
  const [username, setUsername] = useState(member.username ?? "");
  const [bio, setBio] = useState(member.bio ?? "");
  const [githubHandle, setGithubHandle] = useState(member.githubHandle ?? "");
  const [phoneNumber, setPhoneNumber] = useState(member.phoneNumber ?? "");
  const [course, setCourse] = useState(member.course ?? "");
  const [yearOfStudy, setYearOfStudy] = useState(member.yearOfStudy ?? "");
  const [campus, setCampus] = useState(member.campus ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("username", username.trim().toLowerCase());
    formData.set("bio", bio);
    formData.set("githubHandle", githubHandle);
    formData.set("phoneNumber", phoneNumber);
    formData.set("course", course);
    formData.set("yearOfStudy", yearOfStudy);
    formData.set("campus", campus);
    if (avatarFile) formData.set("avatar", avatarFile);

    startTransition(async () => {
      const res = await updateMyProfile(formData);
      if (!res.success) {
        setError(res.error ?? "Could not save profile.");
        return;
      }
      if (res.data?.avatarUrl) setPreview(res.data.avatarUrl);
      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={ROUTES.dashboard}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Edit your profile</h1>
          <p className="mt-1 text-sm text-muted">
            Update your photo, name, and username — they appear on your membership card.
          </p>
        </div>
      </div>

      {/* Avatar */}
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="font-display text-sm font-bold text-ink">Profile photo</h2>
        <p className="mt-1 text-xs text-muted">PNG, JPG or WebP · max 5 MB. Used on your printable membership card.</p>

        <div className="mt-5 flex flex-wrap items-center gap-5">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-line bg-cream-2">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-3xl font-extrabold text-ink/40">
                {initials || <User size={32} />}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onPickAvatar}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 rounded-xl"
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={15} /> {preview ? "Change photo" : "Upload photo"}
            </Button>
            {avatarFile && (
              <p className="text-[11px] text-muted">
                New photo selected: <span className="font-medium text-ink">{avatarFile.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="font-display text-sm font-bold text-ink">Identity</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-2">Full name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            placeholder="Your full name"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-2">Username</label>
          <div className="relative">
            <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="chiromo_dev"
              className="rounded-xl pl-9 font-mono text-sm"
              maxLength={24}
            />
          </div>
          <p className="text-[11px] text-muted">Lowercase letters, numbers, underscores. Shown as @{username || "username"} on your card.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-2">Email</label>
          <Input value={member.email} disabled className="cursor-not-allowed rounded-xl opacity-60" />
          <p className="text-[11px] text-muted">Email is tied to your login and cannot be changed here.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={480}
            placeholder="Short intro — what you build, what you're learning…"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-2">Phone</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07xx xxx xxx"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-2">GitHub handle</label>
            <Input
              value={githubHandle}
              onChange={(e) => setGithubHandle(e.target.value)}
              placeholder="username"
              className="rounded-xl font-mono"
            />
          </div>
        </div>
      </div>

      {/* Academic */}
      <div className="space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="font-display text-sm font-bold text-ink">Academic details</h2>
        <p className="text-xs text-muted">These feed your membership card expiry and campus line.</p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-2">Campus / University</label>
          <Input
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            placeholder="Chiromo Campus ( / Science Hub)"
            className="rounded-xl"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-2">Course / Programme</label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="BSc Computer Science"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-2">Year of study</label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-navy"
            >
              <option value="">Select year…</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle2 size={15} /> Saved
            </>
          ) : (
            "Save profile"
          )}
        </Button>
        <Link href={ROUTES.dashboard} className="text-sm font-semibold text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
