import { NextResponse } from "next/server";
import { pollStkStatus } from "@/lib/payments/payhero";

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference")?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(reference)) {
    return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  }

  try {
    const result = await pollStkStatus(reference);
    if ("httpStatus" in result) {
      return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    }
    return NextResponse.json({
      status: result.status,
      receipt: result.receipt,
      error: result.error,
    });
  } catch {
    return NextResponse.json({ error: "Could not check the payment yet." }, { status: 502 });
  }
}
