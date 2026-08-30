import type { ExecTitle } from "@/types/exec-title";

export interface DashboardNavItem {
  slug: string;
  label: string;
}

/** Visible to every signed-in exec, regardless of title. */
export const SHARED_NAV_ITEMS: DashboardNavItem[] = [
  { slug: "calendar", label: "Calendar" },
  { slug: "announcements", label: "Announcements" },
  { slug: "chat", label: "Executive Chat" },
  { slug: "tasks", label: "Task List" },
  { slug: "documents", label: "Recent Documents" },
  { slug: "committee-activity", label: "Committee Activity Feed" },
];

/**
 * Per-title sidebar sections, straight from the platform spec. Every
 * slug here becomes a route at /dashboard/{execTitle}/{slug} — see
 * app/dashboard/[execTitle]/[slug]/page.tsx. Building the real widget
 * for a slug just means adding a case to that page; until then it
 * renders <ComingSoon>.
 */
export const EXEC_NAV: Record<ExecTitle, DashboardNavItem[]> = {
  patron: [
    { slug: "registration-requests", label: "Registration Approvals" },
    { slug: "institutional-oversight", label: "Institutional Oversight" },
    { slug: "faculty-approvals", label: "Faculty Approvals" },
    { slug: "recent-decisions", label: "Signed Decisions" },
    { slug: "policy-documents", label: "Constitution & Policy" },
    { slug: "org-health", label: "Club Health Metrics" },
  ],
  chairperson: [
    { slug: "registration-requests", label: "Member Approvals" },
    { slug: "strategic-analytics", label: "Strategic Analytics" },
    { slug: "executive-performance", label: "Executive Performance" },
    { slug: "committee-reports", label: "Committee Reports" },
    { slug: "meeting-approvals", label: "Meeting Approvals" },
    { slug: "policy-documents", label: "Policy Documents" },
    { slug: "financial-summary", label: "Financial Summary" },
    { slug: "recent-decisions", label: "Recent Decisions" },
    { slug: "signature-queue", label: "Electronic Signature Queue" },
    { slug: "official-letters", label: "Official Letters" },
    { slug: "executive-tasks", label: "Executive Tasks" },
    { slug: "org-health", label: "Organization Health Metrics" },
    { slug: "activity-timeline", label: "Recent Activity Timeline" },
  ],
  vice_chairperson: [
    { slug: "registration-requests", label: "Membership Approvals" },
    { slug: "project-tracker", label: "Project Tracker" },
    { slug: "initiative-dashboard", label: "Initiative Dashboard" },
    { slug: "task-assignments", label: "Task Assignments" },
    { slug: "cross-committee", label: "Cross Committee Collaboration" },
    { slug: "progress-timeline", label: "Progress Timeline" },
    { slug: "risk-tracker", label: "Risk Tracker" },
    { slug: "approvals-waiting", label: "Approvals Waiting" },
    { slug: "meeting-followups", label: "Meeting Follow-ups" },
  ],
  secretary_general: [
    { slug: "meeting-scheduler", label: "Meeting Scheduler" },
    { slug: "agenda-builder", label: "Agenda Builder" },
    { slug: "minute-editor", label: "Minute Editor" },
    { slug: "document-repository", label: "Document Repository" },
    { slug: "letters", label: "Letters" },
    { slug: "archive", label: "Archive" },
    { slug: "decision-log", label: "Decision Log" },
    { slug: "attendance-register", label: "Attendance Register" },
    { slug: "document-search", label: "Document Search" },
  ],
  treasurer: [
    { slug: "budget-planner", label: "Budget Planner" },
    { slug: "income-tracker", label: "Income Tracker" },
    { slug: "expense-tracker", label: "Expense Tracker" },
    { slug: "financial-reports", label: "Financial Reports" },
    { slug: "invoices", label: "Invoices" },
    { slug: "receipt-manager", label: "Receipt Manager" },
    { slug: "sponsors", label: "Sponsors" },
    { slug: "grant-applications", label: "Grant Applications" },
    { slug: "approval-workflow", label: "Approval Workflow" },
    { slug: "financial-charts", label: "Financial Charts" },
  ],
  corporate_affairs: [
    { slug: "partner-crm", label: "Partner CRM" },
    { slug: "sponsor-database", label: "Sponsor Database" },
    { slug: "event-manager", label: "Event Manager" },
    { slug: "guest-speakers", label: "Guest Speakers" },
    { slug: "media-library", label: "Media Library" },
    { slug: "social-calendar", label: "Social Calendar" },
    { slug: "brand-assets", label: "Brand Assets" },
    { slug: "marketing-campaigns", label: "Marketing Campaigns" },
    { slug: "email-campaigns", label: "Email Campaigns" },
    { slug: "press-releases", label: "Press Releases" },
  ],
  training_coordinator: [
    { slug: "course-manager", label: "Course Manager" },
    { slug: "workshop-calendar", label: "Workshop Calendar" },
    { slug: "mentorship", label: "Mentorship" },
    { slug: "assignments", label: "Assignments" },
    { slug: "progress-tracking", label: "Progress Tracking" },
    { slug: "resource-library", label: "Resource Library" },
    { slug: "learning-paths", label: "Learning Paths" },
    { slug: "quiz-builder", label: "Quiz Builder" },
    { slug: "certificates", label: "Certificates" },
    { slug: "feedback", label: "Feedback" },
  ],
  membership_officer: [
    { slug: "member-directory", label: "Member Directory" },
    { slug: "registration-requests", label: "Registration Requests" },
    { slug: "approval-queue", label: "Approval Queue" },
    { slug: "attendance", label: "Attendance" },
    { slug: "teams", label: "Teams" },
    { slug: "volunteers", label: "Volunteers" },
    { slug: "events-participation", label: "Events Participation" },
    { slug: "engagement-analytics", label: "Engagement Analytics" },
    { slug: "badges", label: "Badges" },
    { slug: "achievements", label: "Achievements" },
    { slug: "feedback", label: "Feedback" },
  ],
};

/** Reverse lookup used by the dynamic route to check "does this slug belong to this title?". */
export function isSlugForExecTitle(execTitle: ExecTitle, slug: string): boolean {
  return EXEC_NAV[execTitle].some((item) => item.slug === slug);
}
