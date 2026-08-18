import type { Database, SqlJsStatic } from "sql.js";

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

/** Loads the sql.js WASM binary once and reuses it for every SQL challenge on the page. */
function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = import("sql.js").then((mod) =>
      mod.default({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` }),
    );
  }
  return sqlJsPromise;
}

export async function createPracticeDb(setupSql: string): Promise<Database> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();
  db.run(setupSql);
  return db;
}

export type QueryResult = { columns: string[]; rows: Record<string, unknown>[] };

export function runQuery(db: Database, query: string): QueryResult {
  const results = db.exec(query);
  if (results.length === 0) return { columns: [], rows: [] };
  const { columns, values } = results[0];
  const rows = values.map((row) => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
  return { columns, rows };
}

/** Order-sensitive: the learner is expected to ORDER BY as the prompt asks. */
export function resultsMatch(actual: Record<string, unknown>[], expected: Record<string, unknown>[]): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}