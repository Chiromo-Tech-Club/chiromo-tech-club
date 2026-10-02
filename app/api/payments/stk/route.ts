import { NextResponse } from "next/server";
import {
  formatMpesaPhone,
  initiateStkPush,
  isMembershipAmount,
} from "@/lib/payments/payhero";

function callbackUrl(req: Request): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv?.startsWith("https://")) return `${fromEnv}/api/payments/stk/callback`;
  const origin = new URL(req.url).origin;
  if (origin.startsWith("https://")) return `${origin}/api/payments/stk/callback`;
  return undefined;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const amount = Number(record.amount);
  const phone = formatMpesaPhone(typeof record.phone === "string" ? record.phone : "");
  const customerName = typeof record.customerName === "string" ? record.customerName : undefined;

  if (!isMembershipAmount(amount)) {
    return NextResponse.json({ error: "Choose KES 250 or KES 500." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a Safaricom number, for example 0712345678." },
      { status: 400 },
    );
  }

  const externalReference = `CTC-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  const callback = callbackUrl(req);

  try {
    const result = await initiateStkPush({
      amount,
      phone,
      customerName,
      externalReference,
      callbackUrl: callback,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      reference: result.reference,
      phone,
      amount,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach M-Pesa. Check your connection and try again." },
      { status: 502 },
    );
  }
}
