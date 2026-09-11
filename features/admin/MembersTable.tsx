"use client";

import { useState, useTransition } from "react";
import {
  updateMemberRole,
  approveMember,
  rejectMember,
  updateMemberPaymentStatus,
} from "@/actions/admin/members";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import { EXEC_TITLES, EXEC_TITLE_LABELS, isExecTitle, type ExecTitle } from "@/types/exec-title";
import { MEMBER_STATUS_LABELS } from "@/types/member-status";
import type { Role } from "@/types/roles";
import type { MemberStatus } from "@/types/member-status";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";
import { getCommunityBySlug } from "@/utils/get-community-slug";
import {
  CheckCircle2,
  XCircle,
  Search,
  GraduationCap,
  Building2,
  CreditCard,
  DollarSign,
  Phone,
  Mail,
  Code2,
  Layers,
  Users,
} from "lucide-react";

export interface ExtendedMemberRow {
  id: string;
  fullName: string;
  email: string;
  username?: string | null;
  role: Role;
  execTitle: ExecTitle | null;
  status: MemberStatus;
  avatarUrl?: string | null;
  bio?: string | null;
  githubHandle?: string | null;
  studentId?: string | null;
  campus?: string | null;
  isChiromo?: boolean;
  institutionName?: string | null;
  department?: string | null;
  course?: string | null;
  yearOfStudy?: string | null;
  phoneNumber?: string | null;
  experienceLevel?: string | null;
  learningGoals?: string | null;
  authProvider?: string | null;
  membershipFeeStatus?: "unpaid" | "deposit_paid" | "fully_paid" | string | null;
  feeAmountPaid?: number;
  mpesaReference?: string | null;
  mpesaPhoneNumber?: string | null;
  cardTheme?: string | null;
  communitySlugs?: string[];
  createdAt?: string;
}

type PaymentStatus = "fully_paid" | "deposit_paid";

function trackLabel(slug: string): string {
  return getCommunityBySlug(slug)?.name ?? slug.replace(/-/g, " ");
}

function TrackChips({ slugs, emptyLabel = "No tracks selected" }: { slugs?: string[]; emptyLabel?: string }) {
  if (!slugs?.length) {
    return <p className="text-[11px] text-muted">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {slugs.map((slug) => (
        <span
          key={slug}
          className="inline-flex items-center gap-1 rounded-lg border border-sky/20 bg-sky/5 px-2.5 py-1 text-[11px] font-semibold text-sky"
        >
          <Layers size={11} />
          {trackLabel(slug)}
        </span>
      ))}
    </div>
  );
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink shadow-2xs">
      <svg viewBox="0 0 24 24" className="h-3 w-3">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z" />
        <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.87 8.87 4.75 12 4.75Z" />
      </svg>
      Google Auth
    </span>
  );
}

function EmailBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted shadow-2xs">
      Email / Password
    </span>
  );
}

function DetailRow({
  label,
  value,
  alwaysShow = false,
}: {
  label: string;
  value?: string | null;
  alwaysShow?: boolean;
}) {
  if (!value?.trim() && !alwaysShow) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={cn("mt-0.5 break-words text-sm font-medium", value?.trim() ? "text-ink" : "text-muted")}>
        {value?.trim() || "Not provided"}
      </dd>
    </div>
  );
}

function feeLabel(m: ExtendedMemberRow): string {
  if (m.membershipFeeStatus === "fully_paid") return `Paid KES ${m.feeAmountPaid || 500} (Full)`;
  if (m.membershipFeeStatus === "deposit_paid") return `Paid KES ${m.feeAmountPaid || 250} (Deposit)`;
  return "Unpaid / Pay Later";
}

function experienceLabel(level?: string | null) {
  if (!level) return null;
  const map: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };
  return map[level] ?? level;
}

function MemberProfileDetails({ m }: { m: ExtendedMemberRow }) {
  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-line bg-cream-2">
          {m.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.avatarUrl} alt={m.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-lg font-extrabold text-ink/40">
              {m.fullName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() ?? "")
                .join("")}
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-display text-base font-bold text-ink sm:text-lg">{m.fullName}</h3>
            {m.authProvider === "google" ? <GoogleBadge /> : <EmailBadge />}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                m.status === "approved" && "bg-green/10 text-green",
                m.status === "pending" && "bg-amber-500/10 text-amber-700",
                m.status === "rejected" && "bg-red-500/10 text-red-600",
              )}
            >
              {MEMBER_STATUS_LABELS[m.status] ?? m.status}
            </span>
          </div>
          {m.username && <p className="font-mono text-xs text-muted">@{m.username}</p>}
          {m.bio ? (
            <p className="max-w-2xl text-xs leading-relaxed text-ink-2">{m.bio}</p>
          ) : (
            <p className="text-xs text-muted">No bio submitted.</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 rounded-2xl border border-line/70 bg-cream/40 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Email</dt>
          <dd className="mt-0.5">
            <a
              href={`mailto:${m.email}`}
              className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-sky hover:underline"
            >
              <Mail size={13} className="shrink-0" /> {m.email}
            </a>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Phone</dt>
          <dd className="mt-0.5">
            {m.phoneNumber ? (
              <a
                href={`tel:${m.phoneNumber}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sky hover:underline"
              >
                <Phone size={13} className="shrink-0" /> {m.phoneNumber}
              </a>
            ) : (
              <span className="text-sm text-muted">Not provided</span>
            )}
          </dd>
        </div>
        <DetailRow label="Student / Reg ID" value={m.studentId} alwaysShow />
        <DetailRow label="Course / Programme" value={m.course} alwaysShow />
        <DetailRow label="Year of study" value={m.yearOfStudy} alwaysShow />
        <div className="min-w-0">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Campus</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm font-medium">
            <Building2 size={13} className="shrink-0 text-muted" />
            <span className={m.isChiromo || m.campus?.toLowerCase().includes("chiromo") ? "text-green" : "text-ink"}>
              {m.campus ?? "Chiromo Campus"}
            </span>
            <span className="text-[10px] font-semibold text-muted">({m.isChiromo ? "Chiromo" : "External"})</span>
          </dd>
        </div>
        <DetailRow label="Institution" value={m.institutionName} alwaysShow={!m.isChiromo} />
        <DetailRow label="Department / Faculty" value={m.department} alwaysShow />
        <DetailRow label="Experience level" value={experienceLabel(m.experienceLevel)} alwaysShow />
        <div className="min-w-0 sm:col-span-2 lg:col-span-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Learning goals</dt>
          <dd className={cn("mt-0.5 text-sm", m.learningGoals?.trim() ? "text-ink" : "text-muted")}>
            {m.learningGoals?.trim() || "Not provided"}
          </dd>
        </div>
        {m.githubHandle ? (
          <div className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">GitHub</dt>
            <dd className="mt-0.5">
              <a
                href={`https://github.com/${m.githubHandle}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sky hover:underline"
              >
                <Code2 size={13} /> {m.githubHandle}
              </a>
            </dd>
          </div>
        ) : (
          <DetailRow label="GitHub" value={null} alwaysShow />
        )}
        <DetailRow
          label="Registered"
          value={
            m.createdAt
              ? new Date(m.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })
              : null
          }
          alwaysShow
        />
      </dl>

      <div className="space-y-2">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
          <Layers size={12} /> Technical tracks
        </p>
        <TrackChips slugs={m.communitySlugs} emptyLabel="No tracks selected during registration." />
      </div>

      <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Payment details (from registration)</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">M-Pesa code</p>
            {m.mpesaReference ? (
              <p className="mt-0.5 font-mono text-base font-extrabold tracking-wide text-ink">{m.mpesaReference}</p>
            ) : (
              <p className="mt-0.5 text-sm text-muted">No M-Pesa code submitted.</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">M-Pesa phone</p>
            {m.mpesaPhoneNumber ? (
              <a
                href={`tel:${m.mpesaPhoneNumber}`}
                className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-sky"
              >
                <Phone size={12} /> {m.mpesaPhoneNumber}
              </a>
            ) : (
              <p className="mt-0.5 text-sm text-muted">Not provided</p>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold",
              m.membershipFeeStatus === "fully_paid" && "bg-green/10 text-green",
              m.membershipFeeStatus === "deposit_paid" && "bg-sky/15 text-sky",
              m.membershipFeeStatus !== "fully_paid" &&
                m.membershipFeeStatus !== "deposit_paid" &&
                "bg-cream-2 text-ink-2",
            )}
          >
            <CreditCard size={12} />
            {feeLabel(m)}
          </span>
          {m.studentId && (
            <span className="inline-flex items-center gap-1 rounded-md bg-cream-2 px-2 py-0.5 font-mono text-[11px] font-medium text-ink">
              <GraduationCap size={12} className="text-sky" /> {m.studentId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentControls({
  member: m,
  busy,
  onPayment,
}: {
  member: ExtendedMemberRow;
  busy: boolean;
  onPayment: (status: PaymentStatus, amount: number, mpesaRef?: string) => void;
}) {
  const [mpesaCode, setMpesaCode] = useState(m.mpesaReference ?? "");

  return (
    <div className="space-y-2 rounded-xl border border-line/70 bg-cream/30 p-3">
      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted">Update / save M-Pesa code</span>
        <Input
          value={mpesaCode}
          onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
          placeholder="e.g. QH7X9K2L3M"
          className="rounded-xl font-mono text-xs uppercase"
          maxLength={20}
        />
      </label>
      {m.membershipFeeStatus !== "fully_paid" && (
        <div className="flex flex-col gap-2">
          {m.membershipFeeStatus !== "deposit_paid" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onPayment("deposit_paid", 250, mpesaCode)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-ink hover:bg-cream-2"
            >
              Record KES 250 Deposit
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onPayment("fully_paid", 500, mpesaCode)}
            className="w-full rounded-xl border border-green/30 bg-green/10 px-3 py-2.5 text-xs font-bold text-green hover:bg-green/15"
          >
            {m.membershipFeeStatus === "deposit_paid" ? "Upgrade to KES 500 Fully Paid" : "Record KES 500 Fully Paid"}
          </button>
        </div>
      )}
      {m.membershipFeeStatus === "fully_paid" && mpesaCode.trim() && mpesaCode.trim() !== (m.mpesaReference ?? "") && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onPayment("fully_paid", m.feeAmountPaid || 500, mpesaCode)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-cream-2"
        >
          Save M-Pesa code
        </button>
      )}
    </div>
  );
}

export function MembersTable({ members }: { members: ExtendedMemberRow[] }) {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState<"all" | "chiromo" | "other">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "fully_paid" | "deposit_paid" | "unpaid">("all");
  const [authFilter, setAuthFilter] = useState<"all" | "google" | "email">("all");

  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const pendingCount = members.filter((m) => m.status === "pending").length;
  const approvedCount = members.filter((m) => m.status === "approved").length;
  const chiromoCount = members.filter((m) => m.isChiromo || (m.campus && m.campus.toLowerCase().includes("chiromo"))).length;
  const totalRevenue = members.reduce((sum, m) => sum + (m.feeAmountPaid ?? 0), 0);
  const googleCount = members.filter((m) => m.authProvider === "google").length;

  const filteredMembers = members.filter((m) => {
    if (activeTab === "pending" && m.status !== "pending") return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchId = m.studentId?.toLowerCase().includes(q);
      const matchCourse = m.course?.toLowerCase().includes(q);
      const matchPhone = m.phoneNumber?.toLowerCase().includes(q);
      const matchMpesa = m.mpesaReference?.toLowerCase().includes(q);
      const matchTrack = m.communitySlugs?.some(
        (slug) => trackLabel(slug).toLowerCase().includes(q) || slug.includes(q),
      );
      if (!matchName && !matchEmail && !matchId && !matchCourse && !matchPhone && !matchMpesa && !matchTrack) {
        return false;
      }
    }

    if (campusFilter === "chiromo" && !(m.isChiromo || m.campus?.toLowerCase().includes("chiromo"))) return false;
    if (campusFilter === "other" && (m.isChiromo || m.campus?.toLowerCase().includes("chiromo"))) return false;
    if (paymentFilter !== "all" && m.membershipFeeStatus !== paymentFilter) return false;
    if (authFilter === "google" && m.authProvider !== "google") return false;
    if (authFilter === "email" && m.authProvider === "google") return false;

    return true;
  });

  const handleApprove = (memberId: string) => {
    setActionInProgress(memberId);
    startTransition(async () => {
      await approveMember(memberId, "Approved in admin review");
      setActionInProgress(null);
    });
  };

  const handleReject = (memberId: string) => {
    setActionInProgress(memberId);
    startTransition(async () => {
      await rejectMember(memberId, "Application rejected in review");
      setActionInProgress(null);
    });
  };

  const handlePaymentUpdate = (
    memberId: string,
    status: PaymentStatus,
    amount: number,
    mpesaRef?: string,
  ) => {
    setActionInProgress(memberId);
    startTransition(async () => {
      await updateMemberPaymentStatus(memberId, status, amount, mpesaRef);
      setActionInProgress(null);
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-line/70 bg-surface/90 p-3 shadow-sm backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-semibold text-muted sm:text-xs">Pending Review</span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-600 sm:h-6 sm:w-6 sm:text-xs">
              !
            </span>
          </div>
          <p className="mt-1.5 font-display text-xl font-extrabold text-ink sm:mt-2 sm:text-2xl">{pendingCount}</p>
          <span className="text-[10px] text-muted sm:text-[11px]">Awaiting admin sign-off</span>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/90 p-3 shadow-sm backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-semibold text-muted sm:text-xs">Chiromo</span>
            <Building2 size={14} className="shrink-0 text-sky sm:h-4 sm:w-4" />
          </div>
          <p className="mt-1.5 font-display text-xl font-extrabold text-ink sm:mt-2 sm:text-2xl">{chiromoCount}</p>
          <span className="text-[10px] text-muted sm:text-[11px]">Science Campus</span>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/90 p-3 shadow-sm backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-semibold text-muted sm:text-xs">Verified</span>
            <CheckCircle2 size={14} className="shrink-0 text-green sm:h-4 sm:w-4" />
          </div>
          <p className="mt-1.5 font-display text-xl font-extrabold text-ink sm:mt-2 sm:text-2xl">{approvedCount}</p>
          <span className="text-[10px] text-muted sm:text-[11px]">Fully approved</span>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/90 p-3 shadow-sm backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-semibold text-muted sm:text-xs">Fees</span>
            <DollarSign size={14} className="shrink-0 text-green sm:h-4 sm:w-4" />
          </div>
          <p className="mt-1.5 font-display text-lg font-extrabold font-mono text-green sm:mt-2 sm:text-2xl">
            KES {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted sm:text-[11px]">{googleCount} Google signups</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-line pb-4">
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:w-auto sm:justify-start sm:px-4 ${
              activeTab === "pending"
                ? "bg-navy text-white shadow-sm"
                : "bg-surface text-ink-2 hover:bg-cream-2 hover:text-ink"
            }`}
          >
            <span className="sm:hidden">Pending Queue</span>
            <span className="hidden sm:inline">Pending Approvals Queue</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-navy-deep">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:w-auto sm:justify-start sm:px-4 ${
              activeTab === "all"
                ? "bg-navy text-white shadow-sm"
                : "bg-surface text-ink-2 hover:bg-cream-2 hover:text-ink"
            }`}
          >
            <Users size={14} className="shrink-0" />
            <span className="sm:hidden">All Members</span>
            <span className="hidden sm:inline">All Members &amp; Fee Updates</span>
            <span className="text-[11px] opacity-70">({members.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, phone, M-Pesa, ID, track…"
            className="rounded-xl pl-9 pr-3 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <span className="hidden text-xs font-semibold text-muted sm:mr-1 sm:inline">Filter:</span>
        <select
          value={campusFilter}
          onChange={(e) => setCampusFilter(e.target.value as typeof campusFilter)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-ink sm:w-auto sm:rounded-lg sm:px-2.5 sm:py-1.5"
        >
          <option value="all">All Campuses</option>
          <option value="chiromo">Chiromo Only</option>
          <option value="other">Other Campuses</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-ink sm:w-auto sm:rounded-lg sm:px-2.5 sm:py-1.5"
        >
          <option value="all">All Payment Statuses</option>
          <option value="fully_paid">Fully Paid (500 KES)</option>
          <option value="deposit_paid">Deposit Paid (250 KES)</option>
          <option value="unpaid">Unpaid / Pay Later</option>
        </select>
        <select
          value={authFilter}
          onChange={(e) => setAuthFilter(e.target.value as typeof authFilter)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-ink sm:w-auto sm:rounded-lg sm:px-2.5 sm:py-1.5"
        >
          <option value="all">All Auth Types</option>
          <option value="google">Google Auth</option>
          <option value="email">Email / Password</option>
        </select>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center sm:p-12">
          <p className="text-sm font-semibold text-ink">No members found matching your filters.</p>
          <p className="mt-1 text-xs text-muted">Try clearing your search term or filters.</p>
        </div>
      ) : activeTab === "pending" ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          {filteredMembers.map((m) => (
            <PendingApprovalCard
              key={m.id}
              member={m}
              busy={actionInProgress === m.id}
              onApprove={() => handleApprove(m.id)}
              onReject={() => handleReject(m.id)}
              onPayment={(status, amount, mpesa) => handlePaymentUpdate(m.id, status, amount, mpesa)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-sky/20 bg-sky/5 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky">Member roster</p>
            <p className="mt-1 text-sm font-semibold text-ink">Full details, M-Pesa codes, fee upgrades &amp; exec seats</p>
            <p className="mt-0.5 text-xs text-muted">
              For deposit (KES 250) members, use <span className="font-semibold text-ink">Upgrade to KES 500 Fully Paid</span> when the balance clears.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {filteredMembers.map((m) => (
              <RosterMemberCard
                key={m.id}
                member={m}
                busy={actionInProgress === m.id}
                onPayment={(status, amount, mpesa) => handlePaymentUpdate(m.id, status, amount, mpesa)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingApprovalCard({
  member: m,
  busy,
  onApprove,
  onReject,
  onPayment,
}: {
  member: ExtendedMemberRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPayment: (status: PaymentStatus, amount: number, mpesaRef?: string) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-4 shadow-sm transition-all hover:border-sky/40 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <MemberProfileDetails m={m} />
        <div className="flex w-full flex-col gap-2 border-t border-line/60 pt-4 lg:w-64 lg:shrink-0 lg:border-t-0 lg:pt-0">
          <PaymentControls member={m} busy={busy} onPayment={onPayment} />
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={onReject}
            className="flex w-full items-center justify-center gap-1 rounded-xl border-red-200 text-xs text-red-600 hover:bg-red-50"
          >
            <XCircle size={14} /> Reject
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={onApprove}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-green px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-green/90"
          >
            <CheckCircle2 size={15} /> Approve Membership
          </Button>
        </div>
      </div>
    </div>
  );
}

function useMemberRoleEditor(member: ExtendedMemberRow) {
  const [role, setRole] = useState<Role>(member.role);
  const [execTitle, setExecTitle] = useState<ExecTitle | null>(member.execTitle);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = role !== member.role || execTitle !== member.execTitle;

  function save() {
    startTransition(async () => {
      const result = await updateMemberRole({
        memberId: member.id,
        role,
        execTitle: role === "exec" || role === "admin" ? execTitle : null,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return { role, setRole, execTitle, setExecTitle, isPending, saved, dirty, save };
}

function RosterMemberCard({
  member: m,
  busy,
  onPayment,
}: {
  member: ExtendedMemberRow;
  busy: boolean;
  onPayment: (status: PaymentStatus, amount: number, mpesaRef?: string) => void;
}) {
  const { role, setRole, execTitle, setExecTitle, isPending, saved, dirty, save } = useMemberRoleEditor(m);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <MemberProfileDetails m={m} />
        <div className="flex w-full flex-col gap-3 border-t border-line/60 pt-4 lg:w-72 lg:shrink-0 lg:border-t-0 lg:pt-0">
          <PaymentControls member={m} busy={busy || isPending} onPayment={onPayment} />

          <div className="space-y-2 rounded-xl border border-line/70 bg-cream/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Club role &amp; exec seat</p>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-medium text-ink"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {(role === "exec" || role === "admin") && (
              <select
                value={execTitle ?? ""}
                onChange={(e) => setExecTitle(isExecTitle(e.target.value) ? e.target.value : null)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-medium text-ink"
              >
                <option value="" disabled={role === "exec"}>
                  {role === "exec" ? "Select executive seat…" : "Optional seat…"}
                </option>
                {role === "admin" ? <option value="">No seat — Administrator only</option> : null}
                {EXEC_TITLES.map((t) => (
                  <option key={t} value={t}>
                    {EXEC_TITLE_LABELS[t]}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="primary"
              size="sm"
              disabled={!dirty || isPending || (role === "exec" && !execTitle)}
              onClick={save}
              className="w-full rounded-xl text-xs"
            >
              {isPending ? "Saving…" : saved ? "Saved" : "Save Role"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
