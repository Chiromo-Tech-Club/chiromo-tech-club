import { NextResponse } from "next/server";
import { executeCode } from "@/lib/academy/piston";

export async function POST(req: Request) {
  const { language, code, stdin } = await req.json();

  if (!language || typeof code !== "string") {
    return NextResponse.json({ error: "language and code are required" }, { status: 400 });
  }

  try {
    const result = await executeCode({ language, code, stdin: stdin ?? "" });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Execution failed" }, { status: 500 });
  }
}