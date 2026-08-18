const PISTON_URL = "https://emkc.org/api/v2/piston";

/** Maps our internal language keys to Piston's language ids and the filename each needs. */
const LANGUAGE_CONFIG: Record<string, { alias: string; fileName: string }> = {
  python: { alias: "python", fileName: "main.py" },
  javascript: { alias: "javascript", fileName: "main.js" },
  java: { alias: "java", fileName: "Main.java" },
  cpp: { alias: "cpp", fileName: "main.cpp" },
};

type Runtime = { language: string; version: string };

// Piston's runtime list rarely changes — cache it for the life of the server process
// instead of hitting /runtimes on every single execution.
let runtimeCache: Runtime[] | null = null;

async function getRuntimeVersion(alias: string): Promise<string> {
  if (!runtimeCache) {
    const res = await fetch(`${PISTON_URL}/runtimes`);
    if (!res.ok) throw new Error("Could not reach the code execution service");
    runtimeCache = await res.json();
  }
  const runtime = runtimeCache!.find((r) => r.language === alias);
  if (!runtime) throw new Error(`No runtime available for "${alias}"`);
  return runtime.version;
}

export type ExecuteResult = {
  stdout: string;
  stderr: string;
  compileError: string | null;
  exitCode: number | null;
  timedOut: boolean;
};

export async function executeCode({
  language,
  code,
  stdin,
  timeLimitMs = 5000,
}: {
  language: string;
  code: string;
  stdin: string;
  timeLimitMs?: number;
}): Promise<ExecuteResult> {
  const config = LANGUAGE_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const version = await getRuntimeVersion(config.alias);

  const res = await fetch(`${PISTON_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: config.alias,
      version,
      files: [{ name: config.fileName, content: code }],
      stdin,
      run_timeout: timeLimitMs,
    }),
  });

  if (!res.ok) throw new Error(`Execution service returned ${res.status}`);
  const data = await res.json();

  return {
    stdout: data.run?.stdout ?? "",
    stderr: data.run?.stderr ?? "",
    compileError: data.compile?.stderr || data.compile?.code !== 0 ? data.compile?.stderr ?? null : null,
    exitCode: data.run?.code ?? null,
    timedOut: data.run?.signal === "SIGKILL",
  };
}

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIG) as Array<keyof typeof LANGUAGE_CONFIG>;

export const DEFAULT_STARTER: Record<string, string> = {
  python: `# Read input with input(), print your answer with print()\n\n`,
  javascript: `// Read stdin, then print your answer with console.log()\nconst line = require("fs").readFileSync(0, "utf8").trim();\n\n`,
  java: `import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // your code here\n  }\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // your code here\n  return 0;\n}\n`,
};