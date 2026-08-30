import { NextResponse } from "next/server";
import { executeCode } from "@/lib/academy/piston";
import { runSandboxCode } from "@/lib/academy/sandbox-runner";

export async function POST(req: Request) {
  const { language, code, stdin } = await req.json();

  if (!language || typeof code !== "string") {
    return NextResponse.json({ error: "language and code are required" }, { status: 400 });
  }

  // 1. Try remote Piston execution if available
  try {
    const result = await executeCode({ language, code, stdin: stdin ?? "" });
    return NextResponse.json(result);
  } catch (err) {
    // 2. Seamlessly fall back to safe client/server sandbox runner (zero external dependency)
    try {
      const sandboxResult = await runSandboxCode({ language, code, stdin: stdin ?? "" });
      return NextResponse.json(sandboxResult);
    } catch (fallbackErr) {
      return NextResponse.json(
        { error: fallbackErr instanceof Error ? fallbackErr.message : "Execution failed" },
        { status: 500 },
      );
    }
  }
}
