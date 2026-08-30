"use client";

import { useState, useTransition } from "react";
import { 
  updateMemberRole, 
  approveMember, 
  rejectMember, 
  updateMemberPaymentStatus 
} from "@/actions/admin/members";
import { ROLES } from "@/constants/roles";
import { EXEC_TITLES, EXEC_TITLE_LABELS, isExecTitle, type ExecTitle } from "@/types/exec-title";
import { MEMBER_STATUS_LABELS } from "@/types/member-status";
import type { Role } from "@/types/roles";
import type { MemberStatus } from "@/types/member-status";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  GraduationCap, 
  Building2, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  DollarSign,
  Users
} from "lucide-react";

export interface ExtendedMemberRow {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  execTitle: ExecTitle | null;
  status: MemberStatus;
  studentId?: string | null;
  campus?: string | null;
  isChiromo?: boolean;
  course?: string | null;
  yearOfStudy?: string | null;
  phoneNumber?: string | null;
  authProvider?: string | null; // 'google' | 'email_password'
  membershipFeeStatus?: "unpaid" | "deposit_paid" | "fully_paid" | string | null;
  feeAmountPaid?: number;
  mpesaReference?: string | null;
  communitySlugs?: string[];
  createdAt?: string;
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

export function MembersTable({ members }: { members: ExtendedMemberRow[] }) {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState<"all" | "chiromo" | "other">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "fully_paid" | "deposit_paid" | "unpaid">("all");
  const [authFilter, setAuthFilter] = useState<"all" | "google" | "email">("all");
  
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Metrics
  const pendingCount = members.filter((m) => m.status === "pending").length;
  const approvedCount = members.filter((m) => m.status === "approved").length;
  const chiromoCount = members.filter((m) => m.isChiromo || (m.campus && m.campus.toLowerCase().includes("chiromo"))).length;
  const totalRevenue = members.reduce((sum, m) => sum + (m.feeAmountPaid ?? 0), 0);
  const googleCount = members.filter((m) => m.authProvider === "google").length;

  const filteredMembers = members.filter((m) => {
    // Tab filter
    if (activeTab === "pending" && m.status !== "pending") return false;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchId = m.studentId?.toLowerCase().includes(q);
      const matchCourse = m.course?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId && !matchCourse) return false;
    }

    // Campus filter
    if (campusFilter === "chiromo" && !(m.isChiromo || m.campus?.toLowerCase().includes("chiromo"))) return false;
    if (campusFilter === "other" && (m.isChiromo || m.campus?.toLowerCase().includes("chiromo"))) return false;

    // Payment filter
    if (paymentFilter !== "all" && m.membershipFeeStatus !== paymentFilter) return false;

    // Auth filter
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

  const handlePaymentUpdate = (memberId: string, status: "fully_paid" | "deposit_paid", amount: number) => {
    setActionInProgress(memberId);
    startTransition(async () => {
      await updateMemberPaymentStatus(memberId, status, amount);
      setActionInProgress(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-line/70 bg-surface/90 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Pending Review</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
              !
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">{pendingCount}</p>
          <span className="text-[11px] text-muted">Awaiting admin sign-off</span>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/90 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Chiromo (Jerome)</span>
            <Building2 size={16} className="text-sky" />
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">{chiromoCount}</p>
          <span className="text-[11px] text-muted">Science Campus Members</span>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/90 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Verified & Active</span>
            <CheckCircle2 size={16} className="text-green" />
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-ink">{approvedCount}</p>
          <span className="text-[11px] text-muted">Fully approved members</span>
        </div>

        <div className="rounded-2xl border border-line/70 bg-surface/90 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Fees & Deposits</span>
            <DollarSign size={16} className="text-green" />
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-green font-mono">
            KES {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-muted">{googleCount} Google signups</span>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "pending"
                ? "bg-navy text-white shadow-sm"
                : "bg-surface text-ink-2 hover:bg-cream-2 hover:text-ink"
            }`}
          >
            <span>Pending Approvals Queue</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-extrabold text-navy-deep">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-navy text-white shadow-sm"
                : "bg-surface text-ink-2 hover:bg-cream-2 hover:text-ink"
            }`}
          >
            <Users size={14} />
            <span>All Members & Exec Seats</span>
            <span className="text-[11px] opacity-70">({members.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, course..."
            className="pl-9 pr-3 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Filter Badges Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-xs font-semibold text-muted mr-1">Filter:</span>
        
        {/* Campus */}
        <select
          value={campusFilter}
          onChange={(e) => setCampusFilter(e.target.value as any)}
          className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink"
        >
          <option value="all">All Campuses</option>
          <option value="chiromo">Chiromo (Jerome) Only</option>
          <option value="other">Other Campuses</option>
        </select>

        {/* Payment */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as any)}
          className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink"
        >
          <option value="all">All Payment Statuses</option>
          <option value="fully_paid">Fully Paid (500 KES)</option>
          <option value="deposit_paid">Deposit Paid (250 KES)</option>
          <option value="unpaid">Unpaid / Pay Later</option>
        </select>

        {/* Auth Provider */}
        <select
          value={authFilter}
          onChange={(e) => setAuthFilter(e.target.value as any)}
          className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink"
        >
          <option value="all">All Auth Types</option>
          <option value="google">Google Auth</option>
          <option value="email">Email / Password</option>
        </select>
      </div>

      {/* Membership Applications & Roster Cards/Table */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-12 text-center">
          <p className="text-sm font-semibold text-ink">No members found matching your filters.</p>
          <p className="mt-1 text-xs text-muted">Try clearing your search term or filters.</p>
        </div>
      ) : activeTab === "pending" ? (
        /* PENDING APPROVALS QUEUE (Rich Cards) */
        <div className="grid grid-cols-1 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-5 shadow-sm transition-all hover:border-sky/40 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                
                {/* Applicant Profile */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-ink">{m.fullName}</h3>
                    {m.authProvider === "google" ? <GoogleBadge /> : <EmailBadge />}
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Pending Approval
                    </span>
                  </div>

                  <p className="text-xs text-muted flex items-center gap-1">
                    <span>{m.email}</span>
                    {m.phoneNumber && <span>• {m.phoneNumber}</span>}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-ink-2">
                    {m.studentId && (
                      <span className="flex items-center gap-1 font-mono font-medium text-ink bg-cream-2 px-2 py-0.5 rounded-md">
                        <GraduationCap size={13} className="text-sky" /> {m.studentId}
                      </span>
                    )}

                    {m.course && (
                      <span className="font-medium text-ink">
                        {m.course} {m.yearOfStudy ? `(${m.yearOfStudy})` : ""}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-xs">
                      <Building2 size={13} className="text-muted" />
                      <strong className={m.isChiromo || m.campus?.toLowerCase().includes("chiromo") ? "text-green" : "text-ink-2"}>
                        {m.campus ?? "Chiromo Campus"}
                      </strong>
                    </span>
                  </div>

                  {/* Payment & Tracks */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                      m.membershipFeeStatus === "fully_paid"
                        ? "bg-green/10 text-green"
                        : m.membershipFeeStatus === "deposit_paid"
                        ? "bg-sky/15 text-sky"
                        : "bg-cream-2 text-ink-2"
                    }`}>
                      <CreditCard size={12} />
                      {m.membershipFeeStatus === "fully_paid"
                        ? "Paid KES 500 (Full)"
                        : m.membershipFeeStatus === "deposit_paid"
                        ? "Paid KES 250 (Deposit)"
                        : "Unpaid / Pay Later"}
                    </span>

                    {m.mpesaReference && (
                      <span className="font-mono text-[11px] text-muted">
                        M-Pesa: <strong>{m.mpesaReference}</strong>
                      </span>
                    )}

                    {m.communitySlugs && m.communitySlugs.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.communitySlugs.map((slug) => (
                          <span key={slug} className="rounded-md bg-cream px-2 py-0.5 text-[10px] text-ink-2 capitalize">
                            {slug.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-line/60 pt-4 lg:border-t-0 lg:pt-0">
                  {/* Mark as Deposit / Full Pay if pending payment */}
                  {m.membershipFeeStatus !== "fully_paid" && (
                    <button
                      type="button"
                      disabled={actionInProgress === m.id}
                      onClick={() => handlePaymentUpdate(m.id, "fully_paid", 500)}
                      className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream-2"
                    >
                      Record KES 500 Paid
                    </button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={actionInProgress === m.id}
                    onClick={() => handleReject(m.id)}
                    className="flex items-center gap-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50 text-xs"
                  >
                    <XCircle size={14} /> Reject
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={actionInProgress === m.id}
                    onClick={() => handleApprove(m.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-green px-4 py-2 font-bold text-white shadow-sm hover:bg-green/90 text-xs"
                  >
                    <CheckCircle2 size={15} /> Approve Membership
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ALL MEMBERS & EXECUTIVE SEAT TABLE */
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cream/40 text-xs uppercase tracking-wide text-muted">
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Auth / Campus</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Exec Title</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <MemberRowItem key={m.id} member={m} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MemberRowItem({ member }: { member: ExtendedMemberRow }) {
  const [role, setRole] = useState<Role>(member.role);
  const [execTitle, setExecTitle] = useState<ExecTitle | null>(member.execTitle);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = role !== member.role || execTitle !== member.execTitle;

  function save() {
    startTransition(async () => {
      const result = await updateMemberRole({ memberId: member.id, role, execTitle: role === "exec" ? execTitle : null });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return (
    <tr className="border-b border-line hover:bg-cream/20">
      <td className="py-3 px-4">
        <div className="text-sm font-bold text-ink">{member.fullName}</div>
        <div className="text-xs text-muted">{member.email}</div>
        {member.studentId && (
          <div className="font-mono text-[11px] text-ink-2">{member.studentId}</div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="space-y-1">
          {member.authProvider === "google" ? <GoogleBadge /> : <EmailBadge />}
          <div className="text-xs text-muted font-medium">
            {member.campus ?? "Chiromo Campus"}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold",
            member.status === "approved" && "bg-green/10 text-green",
            member.status === "pending" && "bg-amber-500/10 text-amber-700",
            member.status === "rejected" && "bg-red-500/10 text-red-600",
          )}
        >
          {MEMBER_STATUS_LABELS[member.status] ?? member.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink font-medium"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.toUpperCase()}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 px-4">
        {role === "exec" ? (
          <select
            value={execTitle ?? ""}
            onChange={(e) => setExecTitle(isExecTitle(e.target.value) ? e.target.value : null)}
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink font-medium"
          >
            <option value="" disabled>
              Select executive seat…
            </option>
            {EXEC_TITLES.map((t) => (
              <option key={t} value={t}>
                {EXEC_TITLE_LABELS[t]}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <Button
          variant="primary"
          size="sm"
          disabled={!dirty || isPending || (role === "exec" && !execTitle)}
          onClick={save}
          className="rounded-lg text-xs"
        >
          {isPending ? "Saving…" : saved ? "Saved" : "Save Seat"}
        </Button>
      </td>
    </tr>
  );
}
