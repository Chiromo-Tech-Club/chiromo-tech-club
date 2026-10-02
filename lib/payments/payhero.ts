/**
 * PayHero M-Pesa STK (Lipa na M-Pesa / Paybill).
 * Credentials stay in PAYHERO_USERNAME and PAYHERO_PASSWORD.
 * Channel defaults to the CTC Paybill channel (override with PAYHERO_CHANNEL_ID).
 */

const PAYHERO_API = "https://backend.payhero.co.ke/api/v2";

export const PAYHERO_CHANNEL_ID = Number(process.env.PAYHERO_CHANNEL_ID || "13425");
export const MEMBERSHIP_AMOUNTS = [250, 500] as const;

export type MembershipAmount = (typeof MEMBERSHIP_AMOUNTS)[number];

export function isMembershipAmount(value: number): value is MembershipAmount {
  return value === 250 || value === 500;
}

/** Safaricom MSISDN as 07… / 01… (10 digits), the shape PayHero expects. */
export function formatMpesaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("254")) local = `0${local.slice(3)}`;
  if (local.length === 9) local = `0${local}`;
  if (!/^0[17]\d{8}$/.test(local)) return null;
  return local;
}

function authHeader(): string | null {
  const username = process.env.PAYHERO_USERNAME?.trim();
  const password = process.env.PAYHERO_PASSWORD?.trim();
  if (!username || !password) return null;
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export function payheroConfigured(): boolean {
  return authHeader() !== null && Number.isFinite(PAYHERO_CHANNEL_ID) && PAYHERO_CHANNEL_ID > 0;
}

export type StkInitResult =
  | { ok: true; reference: string; checkoutRequestId: string | null }
  | { ok: false; error: string; status: number };

export async function initiateStkPush(input: {
  amount: MembershipAmount;
  phone: string;
  customerName?: string;
  externalReference: string;
  callbackUrl?: string;
}): Promise<StkInitResult> {
  const authorization = authHeader();
  if (!authorization) {
    return {
      ok: false,
      status: 503,
      error: "M-Pesa prompts are not configured. Set PAYHERO_USERNAME and PAYHERO_PASSWORD.",
    };
  }

  const body: Record<string, unknown> = {
    amount: input.amount,
    phone_number: input.phone,
    channel_id: PAYHERO_CHANNEL_ID,
    provider: "m-pesa",
    network_code: "63902",
    external_reference: input.externalReference,
  };
  if (input.customerName?.trim()) body.customer_name = input.customerName.trim().slice(0, 80);
  if (input.callbackUrl) body.callback_url = input.callbackUrl;

  const response = await fetch(`${PAYHERO_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !data || data.success === false) {
    return {
      ok: false,
      status: response.ok ? 502 : response.status,
      error: readablePayheroError(data) ?? "Could not send the M-Pesa prompt. Try again.",
    };
  }

  const reference = typeof data.reference === "string" ? data.reference.trim() : "";
  if (!reference) {
    return { ok: false, status: 502, error: "PayHero did not return a payment reference." };
  }

  return {
    ok: true,
    reference,
    checkoutRequestId: typeof data.CheckoutRequestID === "string" ? data.CheckoutRequestID : null,
  };
}

export type StkPollResult = {
  status: "QUEUED" | "SUCCESS" | "FAILED" | "UNKNOWN";
  receipt: string | null;
  error: string | null;
};

export async function pollStkStatus(reference: string): Promise<StkPollResult | { error: string; httpStatus: number }> {
  const authorization = authHeader();
  if (!authorization) {
    return { error: "M-Pesa prompts are not configured.", httpStatus: 503 };
  }

  const response = await fetch(
    `${PAYHERO_API}/transaction-status?reference=${encodeURIComponent(reference)}`,
    { headers: { Authorization: authorization }, cache: "no-store" },
  );
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !data) {
    return {
      error: readablePayheroError(data) ?? "Could not check the payment yet.",
      httpStatus: response.ok ? 502 : response.status,
    };
  }

  const status = normalizeStatus(data.status);
  return {
    status,
    receipt: extractReceipt(data),
    error: status === "FAILED" ? readablePayheroError(data) ?? "The M-Pesa prompt was cancelled or failed." : null,
  };
}

function normalizeStatus(raw: unknown): StkPollResult["status"] {
  const value = String(raw ?? "").trim().toUpperCase();
  if (value === "SUCCESS" || value === "COMPLETED") return "SUCCESS";
  if (value === "FAILED" || value === "FAILURE" || value === "CANCELLED" || value === "CANCELED") return "FAILED";
  if (value === "QUEUED" || value === "PENDING" || value === "") return "QUEUED";
  return "UNKNOWN";
}

function extractReceipt(data: Record<string, unknown>): string | null {
  const candidates = [
    data.provider_reference,
    data.third_party_reference,
    data.MpesaReceiptNumber,
    data.mpesa_receipt_number,
    data.receipt_number,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const code = candidate.trim().toUpperCase();
    if (code.length < 4 || code.length > 20) continue;
    if (code.startsWith("COST_") || code.startsWith("WS_")) continue;
    if (!/^[A-Z0-9]+$/.test(code)) continue;
    return code;
  }
  return null;
}

function readablePayheroError(data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  const direct = data.error ?? data.message ?? data.detail ?? data.ResultDesc;
  if (typeof direct === "string" && direct.trim()) return direct.trim().slice(0, 180);
  return null;
}
