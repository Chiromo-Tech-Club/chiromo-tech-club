"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  User, 
  GraduationCap, 
  Code2, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck,
  AlertCircle,
  QrCode,
  Check,
  MessageCircle,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { COMMUNITIES } from "@/data/communities";
import { submitClubRegistration } from "@/actions/registration";
import { type FullRegistrationInput } from "@/lib/validations/registration";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { ROUTES } from "@/constants/routes";

const CAMPUS_OPTIONS = [
  { id: "chiromo", label: "Chiromo Campus (Jerome / Science Hub)", isChiromo: true },
  { id: "main", label: "Main Campus (CBD)", isChiromo: false },
  { id: "kenya_science", label: "Kenya Science Campus", isChiromo: false },
  { id: "upper_kabete", label: "Upper Kabete Campus (CAVS)", isChiromo: false },
  { id: "parklands", label: "Parklands Law Campus", isChiromo: false },
  { id: "kikuyu", label: "Kikuyu Campus (CEES)", isChiromo: false },
  { id: "other", label: "Other / External Institution", isChiromo: false },
];

const YEAR_OPTIONS = ["Year 1 (Freshman)", "Year 2 (Sophomore)", "Year 3 (Junior)", "Year 4 (Senior)", "Postgraduate / Masters", "Alumni / Professional"];

export function RegistrationWizard({
  initialUser,
}: {
  initialUser?: { fullName?: string; email?: string } | null;
}) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FullRegistrationInput>({
    fullName: initialUser?.fullName ?? "",
    email: initialUser?.email ?? "",
    phoneNumber: "",
    githubHandle: "",
    bio: "",
    studentId: "",
    campus: "Chiromo Campus (Jerome / Science Hub)",
    isChiromo: true,
    faculty: "Faculty of Science & Technology",
    course: "",
    yearOfStudy: "Year 1 (Freshman)",
    communitySlugs: ["artificial-intelligence", "software-engineering"],
    experienceLevel: "beginner",
    learningGoals: "",
    paymentOption: "full_500",
    mpesaReference: "",
    mpesaPhoneNumber: "",
    agreedToCodeOfConduct: true,
  });

  const [registrationResult, setRegistrationResult] = useState<{ isNewGuest?: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 2) {
        errors.fullName = "Please enter your full official name.";
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address.";
      }
      if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 9) {
        errors.phoneNumber = "Please enter a valid phone number.";
      }
    } else if (step === 2) {
      if (!formData.studentId.trim() || formData.studentId.length < 3) {
        errors.studentId = "Student / Registration ID is required (e.g. P15/12345/2024).";
      }
      if (!formData.course.trim() || formData.course.length < 2) {
        errors.course = "Please specify your degree or program of study.";
      }
      if (!formData.campus.trim()) {
        errors.campus = "Please select your campus.";
      }
    } else if (step === 3) {
      if (formData.communitySlugs.length === 0) {
        errors.communitySlugs = "Please select at least one community or technical track.";
      }
    } else if (step === 4) {
      if (formData.paymentOption !== "pay_later" && (!formData.mpesaReference || formData.mpesaReference.trim().length < 4)) {
        errors.mpesaReference = "Please provide the M-Pesa transaction code or select 'Pay Later / Installment'.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMessage(null);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCommunityToggle = (slug: string) => {
    setFormData((prev) => {
      const exists = prev.communitySlugs.includes(slug);
      const updated = exists ? prev.communitySlugs.filter((s) => s !== slug) : [...prev.communitySlugs, slug];
      return { ...prev, communitySlugs: updated };
    });
    if (fieldErrors.communitySlugs) {
      setFieldErrors((prev) => ({ ...prev, communitySlugs: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (!formData.agreedToCodeOfConduct) {
      setFieldErrors({ agreedToCodeOfConduct: "You must accept the club code of conduct to proceed." });
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const res = await submitClubRegistration(formData);

    if (res.success) {
      setRegistrationResult(res.data ?? null);
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(res.error || "Failed to submit registration. Please verify your details.");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-line/60 bg-surface/95 p-8 shadow-2xl backdrop-blur-md sm:p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green/10 text-green ring-8 ring-green/5">
          <CheckCircle2 size={42} strokeWidth={2.4} />
        </div>

        <span className="inline-block rounded-full bg-green/10 px-4 py-1.5 text-xs font-semibold text-green">
          Registration Submitted Successfully
        </span>

        <h2 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Welcome to the Chiromo Wave, {formData.fullName.split(" ")[0]}!
        </h2>

        <p className="mt-4 text-base leading-relaxed text-ink-2">
          Your official membership application for <span className="font-semibold text-ink">{formData.campus}</span> has been received and queued for leadership approval.
        </p>

        {/* WhatsApp Official Community Link Callout */}
        <div className="mt-6 rounded-2xl border-2 border-green/40 bg-gradient-to-br from-green/10 via-surface to-surface p-6 text-left shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green text-white shadow-md">
              <MessageCircle size={26} />
            </div>
            <div className="flex-1">
              <h4 className="font-display text-base font-bold text-ink">Join the Official Chiromo Tech Club WhatsApp</h4>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">
                Connect directly with fellow student builders, track leads, hackathon teams, and receive real-time workshop announcements.
              </p>
              <a
                href="https://chat.whatsapp.com/Hueh8XfmT03EiYmRrTtAOX"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-green/90 active:scale-95"
              >
                <span>Join Official WhatsApp Group</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-6 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-2">Application Summary</h4>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs text-muted">Student ID:</span>
              <p className="font-medium text-ink">{formData.studentId}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Course / Degree:</span>
              <p className="font-medium text-ink">{formData.course}</p>
            </div>
            <div>
              <span className="text-xs text-muted">Payment Tier:</span>
              <p className="font-medium text-ink">
                {formData.paymentOption === "full_500" 
                  ? "500 KES (Full Membership)" 
                  : formData.paymentOption === "deposit_250" 
                  ? "250 KES (Deposit Plan)" 
                  : "Pay Later / Flexible Plan"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted">Technical Tracks:</span>
              <p className="font-medium text-ink capitalize">{formData.communitySlugs.join(", ").replace(/-/g, " ")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {registrationResult?.isNewGuest ? (
            <Button asChild variant="primary" className="rounded-xl px-6 py-3 font-semibold">
              <Link href="/sign-in">Login / Create Account to Link Badge</Link>
            </Button>
          ) : (
            <Button asChild variant="primary" className="rounded-xl px-6 py-3 font-semibold">
              <Link href={ROUTES.dashboard}>Go to Member Dashboard</Link>
            </Button>
          )}
          <Button asChild variant="ghost" className="rounded-xl px-6 py-3 font-semibold">
            <Link href={ROUTES.academy}>Start Interactive Academy</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Top Progress Tracker */}
      <div className="mb-8 rounded-2xl border border-line/60 bg-surface/80 p-4 shadow-sm backdrop-blur-md sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky">
              Step {currentStep} of {totalSteps}
            </span>
            <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
              {currentStep === 1 && "Personal & Contact Details"}
              {currentStep === 2 && "Academic & Campus Profile"}
              {currentStep === 3 && "Technical Tracks & Communities"}
              {currentStep === 4 && "Membership Fee & Payment Plan"}
              {currentStep === 5 && "Review & Confirmation"}
            </h2>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-semibold text-muted">
              {Math.round((currentStep / totalSteps) * 100)}% Completed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line/40">
          <div
            className="h-full bg-gradient-to-r from-sky to-navy transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="mt-4 hidden grid-cols-5 gap-2 text-center text-xs font-medium text-muted sm:grid">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? "text-ink font-semibold" : ""}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${currentStep >= 1 ? "bg-navy text-white" : "bg-line"}`}>1</span>
            Personal
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? "text-ink font-semibold" : ""}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${currentStep >= 2 ? "bg-navy text-white" : "bg-line"}`}>2</span>
            Academic
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? "text-ink font-semibold" : ""}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${currentStep >= 3 ? "bg-navy text-white" : "bg-line"}`}>3</span>
            Tracks
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? "text-ink font-semibold" : ""}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${currentStep >= 4 ? "bg-navy text-white" : "bg-line"}`}>4</span>
            Fee Plan
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 5 ? "text-ink font-semibold" : ""}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${currentStep >= 5 ? "bg-navy text-white" : "bg-line"}`}>5</span>
            Review
          </div>
        </div>
      </div>

      {/* Main Multi-Step Box */}
      <div className="rounded-3xl border border-line/70 bg-surface/95 p-6 shadow-xl backdrop-blur-md sm:p-10">
        
        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-line pb-4">
              <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <User className="text-sky" size={20} /> Let&apos;s get to know you
              </h3>
              <p className="mt-1 text-xs text-text-2">
                Enter your identity and how leadership and members can reach you.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-3">Full Name (Official)</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Victor Ndambuki"
                className="rounded-xl"
              />
              {fieldErrors.fullName && <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-3 flex items-center gap-1">
                  <Mail size={13} /> Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@students.uonbi.ac.ke"
                  className="rounded-xl"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-3 flex items-center gap-1">
                  <Phone size={13} /> Phone / WhatsApp Number
                </label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="0712 345 678"
                  className="rounded-xl"
                />
                {fieldErrors.phoneNumber && <p className="mt-1 text-xs text-red-500">{fieldErrors.phoneNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-3 flex items-center gap-1">
                  <Code2 size={13} /> GitHub Profile (Optional)
                </label>
                <Input
                  value={formData.githubHandle ?? ""}
                  onChange={(e) => setFormData({ ...formData, githubHandle: e.target.value })}
                  placeholder="username (e.g. torvalds)"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-3">Bio / Short Intro (Optional)</label>
                <Input
                  value={formData.bio ?? ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Aspiring software engineer & open source builder"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC & CAMPUS DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-line pb-4">
              <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <GraduationCap className="text-sky" size={20} /> Academic & Campus Verification
              </h3>
              <p className="mt-1 text-xs text-text-2">
                Specify your University registration details and whether you are based at Chiromo (Jerome) campus.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-3">
                  Student Registration / ID Number
                </label>
                <Input
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. P15/143212/2023"
                  className="rounded-xl"
                />
                {fieldErrors.studentId && <p className="mt-1 text-xs text-red-500">{fieldErrors.studentId}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-3">
                  Degree / Program of Study
                </label>
                <Input
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. BSc Computer Science, Mathematics, IT..."
                  className="rounded-xl"
                />
                {fieldErrors.course && <p className="mt-1 text-xs text-red-500">{fieldErrors.course}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-3 flex items-center gap-1">
                <Building2 size={14} /> Campus Location
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {CAMPUS_OPTIONS.map((c) => {
                  const isSelected = formData.campus === c.label;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, campus: c.label, isChiromo: c.isChiromo })}
                      className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-sky bg-sky/5 shadow-sm text-ink ring-1 ring-sky"
                          : "border-line bg-surface hover:bg-cream-2 text-ink-2"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-sky bg-sky text-white" : "border-line"}`}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight text-ink">{c.label}</p>
                        {c.isChiromo && (
                          <span className="mt-1 inline-block rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
                            Official Home Campus
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {fieldErrors.campus && <p className="mt-1 text-xs text-red-500">{fieldErrors.campus}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-3">Year of Study</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {YEAR_OPTIONS.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setFormData({ ...formData, yearOfStudy: yr })}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                      formData.yearOfStudy === yr
                        ? "border-navy bg-navy text-white font-semibold shadow-sm"
                        : "border-line bg-surface hover:bg-cream-2 text-ink"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TECHNICAL TRACKS & COMMUNITIES */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-line pb-4">
              <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <Code2 className="text-sky" size={20} /> Choose your Technical Tracks
              </h3>
              <p className="mt-1 text-xs text-text-2">
                Join one or more specialized learning tracks and community channels.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-text-3">Select Active Communities</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {COMMUNITIES.map((comm) => {
                  const isChecked = formData.communitySlugs.includes(comm.slug);
                  return (
                    <div
                      key={comm.slug}
                      onClick={() => handleCommunityToggle(comm.slug)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isChecked
                          ? "border-sky bg-sky/5 ring-1 ring-sky shadow-sm"
                          : "border-line bg-surface hover:bg-cream-2"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-ink">{comm.name}</span>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-lg border ${isChecked ? "bg-sky border-sky text-white" : "border-line bg-surface"}`}>
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                      <p className="mt-1 text-xs line-clamp-2 text-ink-2">{comm.description}</p>
                    </div>
                  );
                })}
              </div>
              {fieldErrors.communitySlugs && <p className="mt-1.5 text-xs text-red-500">{fieldErrors.communitySlugs}</p>}
            </div>

            <div className="pt-2">
              <label className="mb-2 block text-xs font-semibold text-text-3">Experience Level</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "beginner", title: "Beginner", desc: "Starting fresh / 0-1 yr" },
                  { id: "intermediate", title: "Intermediate", desc: "Building apps & projects" },
                  { id: "advanced", title: "Advanced", desc: "Experienced builder" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, experienceLevel: lvl.id as any })}
                    className={`rounded-2xl border p-3 text-center transition-all ${
                      formData.experienceLevel === lvl.id
                        ? "border-navy bg-navy text-white shadow-sm"
                        : "border-line bg-surface hover:bg-cream-2 text-ink"
                    }`}
                  >
                    <p className="text-xs font-bold">{lvl.title}</p>
                    <p className={`mt-0.5 text-[10px] ${formData.experienceLevel === lvl.id ? "text-white/80" : "text-muted"}`}>{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-3">What do you hope to build or achieve in CTC?</label>
              <Input
                value={formData.learningGoals ?? ""}
                onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
                placeholder="e.g. Master React & Node.js, win hackathons, contribute to open-source"
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        {/* STEP 4: MEMBERSHIP FEE & PAYMENT PLAN */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-line pb-4">
              <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <CreditCard className="text-sky" size={20} /> Membership Fee & Flexible Plan
              </h3>
              <p className="mt-1 text-xs text-text-2">
                Chiromo Tech Club membership is 500 KES inclusive for the full academic year. We offer flexible deposit options.
              </p>
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  id: "full_500",
                  badge: "Best Value",
                  title: "Full Membership",
                  amount: "KES 500",
                  desc: "Full year inclusive membership, official swag, lab access & certs.",
                },
                {
                  id: "deposit_250",
                  badge: "Flexible Deposit",
                  title: "Initial Deposit",
                  amount: "KES 250",
                  desc: "Pay 250 deposit now, finish balance in flexible deposits later.",
                },
                {
                  id: "pay_later",
                  badge: "Installment",
                  title: "Pay Later / Cash",
                  amount: "Flexible",
                  desc: "Register now and clear membership at the Chiromo lab desk or in installments.",
                },
              ].map((tier) => {
                const isSelected = formData.paymentOption === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setFormData({ ...formData, paymentOption: tier.id as any })}
                    className={`relative cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-sky bg-sky/5 shadow-md ring-2 ring-sky"
                        : "border-line bg-surface hover:bg-cream-2"
                    }`}
                  >
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isSelected ? "bg-sky text-white" : "bg-cream-2 text-ink-2"}`}>
                      {tier.badge}
                    </span>
                    <h4 className="mt-2 font-display text-base font-bold text-ink">{tier.title}</h4>
                    <p className="font-mono text-lg font-extrabold text-sky">{tier.amount}</p>
                    <p className="mt-1 text-[11px] leading-tight text-text-2">{tier.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* M-Pesa Instructions Card */}
            <div className="rounded-2xl border border-line bg-gradient-to-br from-green/5 via-surface to-surface p-5">
              {/* <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green font-bold">
                  <QrCode size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-green">M-Pesa Payment Details</h4>
                  <p className="text-xs text-ink-2">Paybill: <strong className="text-ink">522522</strong> | Account: <strong className="text-ink">CTC-{formData.fullName.split(" ")[0]?.toUpperCase() || "MEMBER"}</strong></p>
                </div>
              </div> */}

              {formData.paymentOption !== "pay_later" && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-3">
                      M-Pesa Transaction Code (10 digits)
                    </label>
                    <Input
                      value={formData.mpesaReference ?? ""}
                      onChange={(e) => setFormData({ ...formData, mpesaReference: e.target.value.toUpperCase() })}
                      placeholder="e.g. SLK82910XZ"
                      className="rounded-xl uppercase font-mono"
                    />
                    {fieldErrors.mpesaReference && <p className="mt-1 text-xs text-red-500">{fieldErrors.mpesaReference}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-3">
                      Phone Number Paid From
                    </label>
                    <Input
                      value={formData.mpesaPhoneNumber ?? ""}
                      onChange={(e) => setFormData({ ...formData, mpesaPhoneNumber: e.target.value })}
                      placeholder="07XX XXX XXX"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRMATION */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="border-b border-line pb-4">
              <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="text-sky" size={20} /> Review & Submit Registration
              </h3>
              <p className="mt-1 text-xs text-text-2">
                Confirm your details before sending your application for leadership approval.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-cream/30 p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted">Full Name</span>
                  <p className="text-sm font-bold text-ink">{formData.fullName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Email</span>
                  <p className="text-sm font-bold text-ink">{formData.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Student ID</span>
                  <p className="text-sm font-bold text-ink">{formData.studentId}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Campus</span>
                  <p className="text-sm font-bold text-ink">{formData.campus}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Course & Year</span>
                  <p className="text-sm font-bold text-ink">{formData.course} ({formData.yearOfStudy})</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Selected Communities</span>
                  <p className="text-sm font-bold text-ink capitalize">{formData.communitySlugs.join(", ").replace(/-/g, " ")}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Payment Tier</span>
                  <p className="text-sm font-bold text-ink">
                    {formData.paymentOption === "full_500" ? "500 KES (Full Paid)" : formData.paymentOption === "deposit_250" ? "250 KES (Deposit Paid)" : "Pay Later / Flexible Plan"}
                  </p>
                </div>
                {formData.mpesaReference && (
                  <div>
                    <span className="text-xs text-muted">M-Pesa Reference</span>
                    <p className="font-mono text-sm font-bold text-ink">{formData.mpesaReference}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-line p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToCodeOfConduct}
                  onChange={(e) => setFormData({ ...formData, agreedToCodeOfConduct: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-line text-navy focus:ring-navy"
                />
                <span className="text-xs text-ink-2">
                  I confirm that all provided details are authentic and agree to abide by the <strong>Chiromo Tech Club Constitution</strong>, respect university facilities, and actively participate in club activities.
                </span>
              </label>
              {fieldErrors.agreedToCodeOfConduct && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.agreedToCodeOfConduct}</p>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl px-5"
            >
              <ChevronLeft size={16} /> Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-navy px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-navy/90"
            >
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={status === "submitting"}
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-green px-8 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-green/90 disabled:opacity-50"
            >
              {status === "submitting" ? "Submitting Application…" : "Complete Registration"}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
