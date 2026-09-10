"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Download, Printer } from "lucide-react";
import {
  formatMembershipId,
  getMembershipExpiry,
  formatExpiryDate,
  formatExpiryShort,
  getUniversityInitials,
} from "@/lib/membership/card";
import { generateMembershipQrSvg } from "@/lib/membership/qr";
import {
  CARD_THEMES,
  CARD_THEME_IDS,
  getCardAccessLevel,
  getCardExpiryLabel,
  getCardRoleTitle,
  resolveCardTheme,
  type CardThemeId,
} from "@/lib/membership/card-theme";
import { updateMyCardTheme } from "@/actions/card-theme";

export interface MembershipCardProps {
  memberId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  username?: string | null;
  studentId?: string | null;
  campus?: string | null;
  isChiromo?: boolean | null;
  course?: string | null;
  yearOfStudy?: string | null;
  createdAt?: string | null;
  membershipStatus?: string | null;
  isApproved?: boolean;
  role?: string | null;
  execTitle?: string | null;
  /** Persisted theme id from members.card_theme */
  cardTheme?: string | null;
}

function CircuitBg({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 860 540" fill="none" aria-hidden style={{ color }}>
      <path d="M0 80 H90 V160 H40 V220 H120 V300 H60 V380 H140 V460 H0" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path d="M20 120 H70 V200 H100 V280 H50 V360 H110" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M0 200 H55 M55 200 V250 H95 M95 250 V320" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="90" cy="160" r="3.5" fill="currentColor" />
      <circle cx="120" cy="300" r="3.5" fill="currentColor" />
      <circle cx="140" cy="460" r="3.5" fill="currentColor" />
      <circle cx="55" cy="200" r="3" fill="currentColor" />
      <path d="M860 40 H720 V100 H780 V160 H700 V90 H640" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <circle cx="720" cy="100" r="3.5" fill="currentColor" />
      <circle cx="780" cy="160" r="3.5" fill="currentColor" />
    </svg>
  );
}

function MeshBg({ from, to, soft }: { from: string; to: string; soft?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 right-0 w-[48%] ${soft ? "opacity-25" : "opacity-40"}`}
      style={{
        background: `
          radial-gradient(ellipse at 80% 30%, ${from}55 0%, transparent 55%),
          radial-gradient(ellipse at 70% 80%, ${to}44 0%, transparent 50%),
          repeating-linear-gradient(115deg, transparent 0 10px, ${from}18 10px 11px)
        `,
      }}
      aria-hidden
    />
  );
}

function formatJoined(createdAt?: string | null): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase();
}

function resolveCardStatusLabel(opts: {
  membershipStatus?: string | null;
  isApproved?: boolean;
}): "ACTIVE" | "PENDING" | "REJECTED" {
  const status = (opts.membershipStatus ?? "").toLowerCase().trim();
  if (status === "approved" || opts.isApproved === true) return "ACTIVE";
  if (status === "rejected") return "REJECTED";
  return "PENDING";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function printHtmlDocument(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return;
  }

  let printed = false;
  const cleanup = () => window.setTimeout(() => iframe.remove(), 1200);
  const runPrint = () => {
    if (printed) return;
    printed = true;
    try {
      win.focus();
      win.print();
    } finally {
      cleanup();
    }
  };

  const images = Array.from(doc.images);
  if (images.length === 0) {
    window.setTimeout(runPrint, 350);
    return;
  }

  let settled = 0;
  const done = () => {
    settled += 1;
    if (settled >= images.length) window.setTimeout(runPrint, 250);
  };
  for (const img of images) {
    if (img.complete) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }
  window.setTimeout(runPrint, 3000);
}

function QrBlock({ value, svg }: { value: string; svg: string | null }) {
  return (
    <div
      className="h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden rounded-md bg-white p-1.5 shadow-sm sm:h-20 sm:w-20"
      style={{ boxShadow: "0 0 0 2px currentColor" }}
      title={`QR: ${value}`}
      role="img"
      aria-label={`QR code for membership ${value}`}
    >
      {svg ? (
        <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100">
          <span className="animate-pulse font-mono text-[8px] font-bold text-slate-400">QR…</span>
        </div>
      )}
    </div>
  );
}

export function MembershipCard(props: MembershipCardProps) {
  const membershipId = formatMembershipId({
    campus: props.campus,
    isChiromo: props.isChiromo,
    studentId: props.studentId,
    memberId: props.memberId,
  });

  const [themeId, setThemeId] = useState<CardThemeId>(resolveCardTheme(props.cardTheme).id);
  const theme = CARD_THEMES[themeId];
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [themePending, startThemeTransition] = useTransition();
  const [themeMessage, setThemeMessage] = useState<string | null>(null);

  useEffect(() => {
    setThemeId(resolveCardTheme(props.cardTheme).id);
  }, [props.cardTheme]);

  useEffect(() => {
    let cancelled = false;
    generateMembershipQrSvg(membershipId, { dark: theme.accent, light: "#FFFFFF" })
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch((err) => {
        console.error("QR generation failed:", err);
        if (!cancelled) setQrSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [membershipId, theme.accent]);

  const uni = getUniversityInitials(props.campus, props.isChiromo);
  const { expiresAt, semesterLabel, academicYearLabel } = getMembershipExpiry({
    yearOfStudy: props.yearOfStudy,
    createdAt: props.createdAt,
  });
  const expiryLabel = formatExpiryDate(expiresAt);
  const expiryShort = formatExpiryShort(expiresAt);
  const joinedLabel = formatJoined(props.createdAt);
  const statusLabel = resolveCardStatusLabel({
    membershipStatus: props.membershipStatus,
    isApproved: props.isApproved,
  });
  const roleTitle = getCardRoleTitle(props.role, props.execTitle, {
    isChiromo: props.isChiromo,
    campus: props.campus,
  });
  const accessLevel = getCardAccessLevel(props.role, props.membershipStatus, props.execTitle);
  const cardExpiry = getCardExpiryLabel({
    role: props.role,
    execTitle: props.execTitle,
    expiryShort,
  });
  const displayName = props.fullName.trim().toUpperCase();
  const universityLabel =
    uni === "UN"
      ? "University of Nairobi"
      : props.campus?.replace(/\(.*?\)/g, "").trim() || "Partner Institution";
  const shortCampus = (props.campus || "Chiromo Campus").replace(/\(.*?\)/g, "").trim();
  const yearShort = (props.yearOfStudy || "—").replace(/\(.*?\)/g, "").trim();
  const initials = props.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  function handleThemePick(next: CardThemeId) {
    setThemeId(next);
    setThemeMessage(null);
    startThemeTransition(async () => {
      const res = await updateMyCardTheme(next);
      if (!res.success) {
        setThemeMessage(res.error ?? "Could not save theme");
        setThemeId(resolveCardTheme(props.cardTheme).id);
      } else {
        setThemeMessage("Card color saved");
        window.setTimeout(() => setThemeMessage(null), 1800);
      }
    });
  }

  async function handleDownloadPrint() {
    if (isPreparingPrint) return;
    setIsPreparingPrint(true);
    try {
      let qr = qrSvg;
      if (!qr) {
        try {
          qr = await generateMembershipQrSvg(membershipId, { dark: theme.accent, light: "#FFFFFF" });
          setQrSvg(qr);
        } catch {
          qr = null;
        }
      }

      const logoSrc = `${window.location.origin}/images/image.svg`;
      const photoHtml = props.avatarUrl
        ? `<img class="photo" src="${escapeHtml(props.avatarUrl)}" alt="" crossorigin="anonymous" />`
        : `<div class="photo-fallback">${escapeHtml(initials || "CTC")}</div>`;
      const sigName = escapeHtml(props.fullName.split(" ").slice(0, 2).join(" "));
      const qrHtml = qr ?? `<div class="qr-fallback">${escapeHtml(membershipId)}</div>`;

      const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>CTC Membership Card — ${escapeHtml(membershipId)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@600;700&display=swap');
@page { size: A4 landscape; margin: 10mm; }
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#f4f6f9;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;margin:0}
.card-col{width:100%;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3mm;padding:6mm;page-break-after:always;break-after:page}
.card-col:last-child{page-break-after:auto;break-after:auto}
.side-label{font-size:2.6mm;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#64748b}
.face{width:min(170mm,92vw);aspect-ratio:85.6/53.98;border-radius:5.5mm;overflow:hidden;position:relative;background:${theme.bg};color:${theme.accent};box-shadow:0 6px 24px rgba(0,0,0,.22);${theme.isLight ? `border:0.45mm solid ${theme.accent}33;` : ""}}
.circuit{position:absolute;inset:0;width:100%;height:100%;color:${theme.circuit};opacity:${theme.isLight ? "0.35" : "0.55"};pointer-events:none}
.mesh{position:absolute;inset:0 0 0 52%;opacity:${theme.isLight ? "0.22" : "0.35"};background:radial-gradient(ellipse at 70% 40%, ${theme.meshFrom}66, transparent 55%),radial-gradient(ellipse at 60% 90%, ${theme.meshTo}55, transparent 50%)}
.inner{position:relative;z-index:1;height:100%;padding:5% 5.5%;display:flex;flex-direction:column;min-height:0}
.front-grid{display:grid;grid-template-columns:30% 1fr;gap:4%;flex:1;min-height:0}
.photo-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm}
.photo-ring{width:78%;aspect-ratio:1;max-width:30mm;border-radius:999px;border:2.6px solid ${theme.accent};overflow:hidden;background:${theme.isLight ? "rgba(11,27,58,.06)" : "rgba(255,255,255,.06)"}}
.photo,.photo-fallback{width:100%;height:100%;object-fit:cover;display:block}
.photo-fallback{display:flex;align-items:center;justify-content:center;font-size:7mm;font-weight:800;color:${theme.isLight ? theme.accent : "#fff"};background:${theme.isLight ? "#E8EEF7" : "transparent"}}
.photo-cap{font-size:1.7mm;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${theme.accent}}
.front-main{display:flex;flex-direction:column;min-width:0;min-height:0;height:100%}
.logo-row{display:flex;justify-content:center;margin-bottom:1mm}
.logo{width:12mm;height:12mm;border-radius:999px;background:#fff;padding:1.4mm;object-fit:contain;${theme.isLight ? `box-shadow:0 0 0 0.35mm ${theme.accent}22;` : ""}}
.role{font-size:3.2mm;font-weight:800;letter-spacing:.14em;color:${theme.accent};margin-top:1mm}
.name{font-size:clamp(4mm,2.8vw,6mm);font-weight:800;letter-spacing:.03em;line-height:1.05;margin-top:1.2mm;color:${theme.accent};text-transform:uppercase}
.rows{display:flex;flex-direction:column;gap:1.15mm;margin-top:2.4mm}
.row{font-size:2.3mm;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${theme.accent}}
.front-foot{display:flex;align-items:center;justify-content:flex-end;gap:2.5mm;margin-top:auto;padding-top:2mm}
.scan{font-size:1.7mm;font-weight:800;letter-spacing:.1em;text-transform:uppercase;text-align:right;line-height:1.35;color:${theme.accent}}
.qr{width:18mm;height:18mm;background:#fff;border-radius:1.6mm;padding:1.2mm;overflow:hidden;box-shadow:0 0 0 .45mm ${theme.accent}}
.qr svg{width:100%!important;height:100%!important;display:block}
.qr-fallback{font-size:1.5mm;font-weight:800;color:#0B1324;word-break:break-all}
.back-kicker{font-size:1.7mm;font-weight:800;letter-spacing:.16em;text-transform:uppercase;opacity:.55;color:${theme.accent}}
.back-title{font-size:2.6mm;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin:1mm 0 3mm;color:${theme.accent}}
.back-grid{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 5mm;flex:1}
.k{font-size:1.55mm;letter-spacing:.14em;text-transform:uppercase;opacity:.55;font-weight:700;color:${theme.accent}}
.v{font-size:2.4mm;font-weight:800;margin-top:.55mm;text-transform:uppercase;line-height:1.25;color:${theme.accent};word-break:break-word}
.back-foot{margin-top:auto;padding-top:2.5mm;display:flex;justify-content:space-between;align-items:flex-end;gap:4mm;border-top:.3mm solid ${theme.accent}44}
.sig{font-family:'Caveat',cursive;font-size:5.5mm;margin-top:.6mm;transform:rotate(-2deg);color:${theme.accent}}
.sig-line{width:30mm;height:.3mm;background:${theme.accent}88;margin-top:.6mm}
.mono{font-family:'JetBrains Mono',monospace}
@media print{html,body{background:#fff!important}.card-col{min-height:0;height:100vh;padding:0}.face{box-shadow:none}}
</style></head><body>
  <div class="card-col">
    <div class="side-label">Front</div>
    <div class="face">
      <svg class="circuit" viewBox="0 0 860 540" fill="none"><path d="M0 80 H90 V160 H40 V220 H120 V300 H60 V380 H140 V460 H0" stroke="currentColor" stroke-width="1.2"/><path d="M860 40 H720 V100 H780 V160 H700 V90 H640" stroke="currentColor" stroke-width="1.2"/><circle cx="90" cy="160" r="4" fill="currentColor"/><circle cx="720" cy="100" r="4" fill="currentColor"/></svg>
      <div class="mesh"></div>
      <div class="inner">
        <div class="front-grid">
          <div class="photo-wrap">
            <div class="photo-ring">${photoHtml}</div>
            <div class="photo-cap">Member ID Photo</div>
          </div>
          <div class="front-main">
            <div class="logo-row"><img class="logo" src="${logoSrc}" alt="CTC" /></div>
            <div class="role">${escapeHtml(roleTitle)}</div>
            <div class="name">${escapeHtml(displayName)}</div>
            <div class="rows">
              <div class="row">ID NO: ${escapeHtml(membershipId)}</div>
              <div class="row">Access Level: ${escapeHtml(accessLevel)}</div>
              <div class="row">Expires: ${escapeHtml(cardExpiry)}</div>
              <div class="row">Status: ${escapeHtml(statusLabel)}</div>
            </div>
            <div class="front-foot">
              <div class="scan">Scan for<br/>Member Benefits</div>
              <div class="qr">${qrHtml}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card-col">
    <div class="side-label">Back</div>
    <div class="face">
      <svg class="circuit" viewBox="0 0 860 540" fill="none"><path d="M0 80 H90 V160 H40 V220 H120 V300 H60 V380 H140 V460 H0" stroke="currentColor" stroke-width="1.2"/><circle cx="90" cy="160" r="4" fill="currentColor"/></svg>
      <div class="mesh"></div>
      <div class="inner" style="padding-top:6%">
        <div class="back-kicker">Reverse · Chiromo Tech Club</div>
        <div class="back-title">Member Details</div>
        <div class="back-grid">
          <div>
            <div style="margin-bottom:2.2mm"><div class="k">University</div><div class="v">${escapeHtml(universityLabel)}</div></div>
            <div style="margin-bottom:2.2mm"><div class="k">Campus</div><div class="v">${escapeHtml(shortCampus)}</div></div>
            <div style="margin-bottom:2.2mm"><div class="k">Student Reg</div><div class="v mono">${escapeHtml(props.studentId || "—")}</div></div>
            <div style="margin-bottom:2.2mm"><div class="k">Username</div><div class="v">${escapeHtml(props.username ? "@" + props.username : "—")}</div></div>
          </div>
          <div>
            <div style="margin-bottom:2.2mm"><div class="k">Programme</div><div class="v">${escapeHtml(props.course || "—")}</div></div>
            <div style="margin-bottom:2.2mm"><div class="k">Year · Term</div><div class="v">${escapeHtml(`${yearShort} · ${semesterLabel}`)}</div></div>
            <div style="margin-bottom:2.2mm"><div class="k">Academic Year</div><div class="v">${escapeHtml(academicYearLabel)}</div></div>
            <div style="margin-bottom:2.2mm"><div class="k">Joined</div><div class="v">${escapeHtml(joinedLabel)}</div></div>
          </div>
        </div>
        <div class="back-foot">
          <div>
            <div class="k">Authorized Signature</div>
            <div class="sig">${sigName}</div>
            <div class="sig-line"></div>
          </div>
          <div style="text-align:right">
            <div class="k">Valid Through</div>
            <div class="v mono">${escapeHtml(cardExpiry === "PERPETUAL" ? "PERPETUAL" : expiryLabel)}</div>
            <div class="k" style="margin-top:1.4mm;opacity:.45">Present with campus ID</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

      printHtmlDocument(html);
    } finally {
      setIsPreparingPrint(false);
    }
  }

  const faceClass =
    "relative aspect-[1.68/1] w-full overflow-hidden rounded-[1.25rem] shadow-[0_20px_50px_-15px_rgba(11,27,58,0.55)] ring-1 ring-white/10 sm:rounded-[1.4rem]";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky">Official membership</p>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Your CTC Membership Card
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted">
            Role-based front · academic back. Recolor anytime. Print each side on its own page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleDownloadPrint()}
          disabled={isPreparingPrint}
          className="group inline-flex items-center gap-2 rounded-2xl bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/25 transition-all hover:bg-navy-dark active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          {isPreparingPrint ? <Download size={15} className="animate-pulse" /> : <Printer size={15} />}
          {isPreparingPrint ? "Preparing…" : "Download / Print Card"}
        </button>
      </div>

      {/* Recolor */}
      <div className="rounded-2xl border border-line bg-surface/80 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Recolor your card</p>
            <p className="mt-0.5 text-xs text-ink-2">
              Prefer white? Choose <span className="font-semibold text-ink">White &amp; Navy</span>. Otherwise keep a dark theme.
            </p>
          </div>
          {themeMessage ? <p className="text-[11px] font-semibold text-sky">{themeMessage}</p> : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CARD_THEME_IDS.map((id) => {
            const t = CARD_THEMES[id];
            const active = themeId === id;
            return (
              <button
                key={id}
                type="button"
                disabled={themePending}
                onClick={() => handleThemePick(id)}
                title={t.label}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition ${
                  active ? "border-navy bg-navy/5 text-ink ring-2 ring-navy/20" : "border-line text-muted hover:border-navy/30 hover:text-ink"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full ring-1 ${t.isLight ? "ring-navy/25" : "ring-black/10"}`}
                  style={{
                    background: `linear-gradient(135deg, ${t.bg} 45%, ${t.accent} 45%)`,
                  }}
                />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-3xl gap-6">
        {/* FRONT */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Front</p>
          <div
            className={faceClass}
            style={{
              background: theme.bg,
              color: theme.accent,
              boxShadow: theme.isLight
                ? "0 20px 50px -15px rgba(11,27,58,0.18)"
                : "0 20px 50px -15px rgba(11,27,58,0.55)",
              outline: theme.isLight ? `1px solid ${theme.accent}22` : undefined,
            }}
          >
            <CircuitBg
              className={`pointer-events-none absolute inset-0 h-full w-full ${theme.isLight ? "opacity-70" : ""}`}
              color={theme.circuit}
            />
            <MeshBg from={theme.meshFrom} to={theme.meshTo} soft={theme.isLight} />

            <div className="relative z-10 grid h-full grid-cols-[0.34fr_1fr] gap-3 p-4 sm:gap-5 sm:p-6 md:p-7">
              <div className="flex flex-col items-center justify-center gap-2">
                <div
                  className={`relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full shadow-lg sm:h-28 sm:w-28 md:h-32 md:w-32 ${
                    theme.isLight ? "bg-slate-100" : "bg-navy-deep"
                  }`}
                  style={{ border: `3.5px solid ${theme.accent}` }}
                >
                  {props.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={props.avatarUrl} alt={props.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center font-display text-2xl font-extrabold sm:text-3xl ${
                        theme.isLight ? "text-navy/70" : "text-white/75"
                      }`}
                    >
                      {initials || "CTC"}
                    </div>
                  )}
                </div>
                <p className="text-center text-[8px] font-extrabold uppercase tracking-[0.14em] sm:text-[9px]" style={{ color: theme.accent }}>
                  Member ID Photo
                </p>
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex justify-center sm:justify-end">
                  <div
                    className={`relative h-12 w-12 overflow-hidden rounded-full bg-white p-1.5 shadow-md sm:h-14 sm:w-14 ${
                      theme.isLight ? "ring-1 ring-navy/15" : ""
                    }`}
                  >
                    <Image src="/images/image.svg" alt="Chiromo Tech Club" fill className="object-contain p-0.5" />
                  </div>
                </div>

                <p
                  className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] sm:mt-3 sm:text-xs"
                  style={{ color: theme.accent }}
                >
                  {roleTitle}
                </p>
                <h4
                  className="mt-1 truncate font-display text-lg font-extrabold uppercase leading-tight tracking-wide sm:text-2xl md:text-[1.65rem]"
                  style={{ color: theme.accent }}
                >
                  {displayName}
                </h4>

                <div className="mt-2.5 space-y-1 text-[9px] font-bold uppercase tracking-wide sm:mt-3 sm:space-y-1.5 sm:text-[11px] md:text-xs" style={{ color: theme.accent }}>
                  <p>ID NO: <span className="font-mono tracking-wider">{membershipId}</span></p>
                  <p>Access Level: {accessLevel}</p>
                  <p>Expires: {cardExpiry}</p>
                  <p>Status: {statusLabel}</p>
                </div>

                <div className="mt-auto flex items-end justify-end gap-2.5 pt-3 sm:gap-3" style={{ color: theme.accent }}>
                  <p className="max-w-[5.5rem] text-right text-[8px] font-extrabold uppercase leading-snug tracking-[0.12em] sm:max-w-[6.5rem] sm:text-[9px]">
                    Scan for
                    <br />
                    Member Benefits
                  </p>
                  <QrBlock value={membershipId} svg={qrSvg} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Back</p>
          <div
            className={faceClass}
            style={{
              background: theme.bg,
              color: theme.accent,
              boxShadow: theme.isLight
                ? "0 20px 50px -15px rgba(11,27,58,0.18)"
                : "0 20px 50px -15px rgba(11,27,58,0.55)",
              outline: theme.isLight ? `1px solid ${theme.accent}22` : undefined,
            }}
          >
            <CircuitBg
              className={`pointer-events-none absolute inset-0 h-full w-full ${theme.isLight ? "opacity-70" : "opacity-70"}`}
              color={theme.circuit}
            />
            <MeshBg from={theme.meshFrom} to={theme.meshTo} soft={theme.isLight} />

            <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 md:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] opacity-55">Reverse</p>
                  <p className="mt-0.5 font-display text-sm font-extrabold sm:text-base">Chiromo Tech Club</p>
                </div>
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white p-1 sm:h-10 sm:w-10">
                  <Image src="/images/image.svg" alt="" fill className="object-contain p-0.5" />
                </div>
              </div>

              <div className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-3 sm:mt-5 sm:gap-x-6 sm:gap-y-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">University</p>
                  <p className="mt-0.5 text-xs font-extrabold uppercase sm:text-sm">{universityLabel}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Campus</p>
                  <p className="mt-0.5 truncate text-xs font-extrabold uppercase sm:text-sm">{shortCampus}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Student Reg</p>
                  <p className="mt-0.5 font-mono text-xs font-bold tracking-wide sm:text-sm">{props.studentId || "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Programme</p>
                  <p className="mt-0.5 truncate text-xs font-extrabold uppercase sm:text-sm">{props.course || "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Year · Term</p>
                  <p className="mt-0.5 text-xs font-extrabold uppercase sm:text-sm">
                    {yearShort} · {semesterLabel.replace("Semester ", "S")}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Username</p>
                  <p className="mt-0.5 font-mono text-xs font-bold sm:text-sm">{props.username ? `@${props.username}` : "—"}</p>
                </div>
              </div>

              <div className="mt-auto flex items-end justify-between border-t pt-3" style={{ borderColor: `${theme.accent}33` }}>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Authorized Signature</p>
                  <p
                    className="mt-1 text-2xl font-bold leading-none sm:text-3xl"
                    style={{ fontFamily: "var(--font-cursive), Caveat, cursive", transform: "rotate(-2deg)", color: theme.accent }}
                  >
                    {props.fullName.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <div className="mt-1 h-px w-28" style={{ background: `${theme.accent}66` }} />
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] opacity-55">Valid Through</p>
                  <p className="mt-0.5 font-mono text-sm font-bold">
                    {cardExpiry === "PERPETUAL" ? "PERPETUAL" : expiryLabel}
                  </p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider opacity-45">Present with campus ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
