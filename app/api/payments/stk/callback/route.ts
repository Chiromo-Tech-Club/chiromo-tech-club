import { NextResponse } from "next/server";

/**
 * PayHero posts here after the customer enters their PIN.
 * Registration does not wait on this request — the form polls transaction status
 * and fills the M-Pesa code from there. This route only acknowledges the callback.
 */
export async function POST() {
  return NextResponse.json({ status: true });
}
