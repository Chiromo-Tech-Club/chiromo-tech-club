"use client";

import Editor from "@monaco-editor/react";

const MONACO_LANGUAGE: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
};

export function CodeEditor({
  language,
  value,
  onChange,
  height = "320px",
}: {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height?: string;
}) {
  return (
    <div className="overflow-hidden rounded-card-sm border border-line-strong">
      <Editor
        height={height}
        language={MONACO_LANGUAGE[language] ?? "plaintext"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-dark"
        options={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12 },
          automaticLayout: true,
        }}
      />
    </div>
  );
}