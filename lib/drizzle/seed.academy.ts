/**
 * Seeds the academy with 4 quests, ordered easy → hard, mixing lessons,
 * coding challenges, and a SQL challenge — enough to see the whole feature
 * working end to end.
 *
 * Run with: npx tsx db/seed-academy.ts
 * (adjust the shebang/runner to whatever your project already uses — if
 * you don't have tsx, `npm install -D tsx` first)
 */

// ── ADJUST to match your project ────────────────────────────────────────
import { getDb } from "@/lib/drizzle/client";
import { academyQuests, academyQuestSteps, academyCodingChallenges, academySqlChallenges } from "@/lib/drizzle/schema.academy";
// ─────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding academy…");

  // ───────────────────────── Quest 0: Programming Basics ─────────────────
  const [basics] = await getDb()
    .insert(academyQuests)
    .values({
      slug: "programming-basics",
      title: "Programming Basics",
      description: "Start here — the core ideas every language shares.",
      topic: "Fundamentals",
      order: 0,
      pointsReward: 100,
      iconKey: "compass",
      isPublished: true,
    })
    .returning();

  await getDb().insert(academyQuestSteps).values([
    {
      questId: basics.id,
      order: 0,
      title: "What is a variable?",
      type: "lesson",
      content:
        "A variable is a named box that holds a value. In most languages you create one by giving it a " +
        "name and a value: `age = 20`. You can change what's in the box later — that's the whole point.",
    },
    {
      questId: basics.id,
      order: 1,
      title: "Loops and conditionals",
      type: "lesson",
      content:
        "A loop repeats a block of code. An if-statement runs a block only when a condition is true. " +
        "Together they're how programs make decisions and handle repetition without you writing the same line 100 times.",
    },
  ]);

  const [sumStep] = await getDb()
    .insert(academyQuestSteps)
    .values({
      questId: basics.id,
      order: 2,
      title: "Sum two numbers",
      type: "coding_challenge",
      content: "",
    })
    .returning();

  await getDb().insert(academyCodingChallenges).values({
    stepId: sumStep.id,
    prompt: "Read two integers from stdin (space-separated) and print their sum.",
    difficulty: "easy",
    starterCode: JSON.stringify({
      python: "a, b = map(int, input().split())\n\n",
      javascript:
        'const [a, b] = require("fs").readFileSync(0, "utf8").trim().split(" ").map(Number);\n\n',
      java:
        "import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n\n  }\n}\n",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int a, b;\n  cin >> a >> b;\n\n  return 0;\n}\n",
    }),
    testCases: JSON.stringify([
      { stdin: "2 3", expectedStdout: "5", hidden: false },
      { stdin: "10 -4", expectedStdout: "6", hidden: true },
      { stdin: "0 0", expectedStdout: "0", hidden: true },
    ]),
  });

  // ───────────────────────── Quest 1: Python Warm-up ──────────────────────
  const [pyWarmup] = await getDb()  
    .insert(academyQuests)
    .values({
      slug: "python-warmup",
      title: "Python Warm-up",
      description: "Two short challenges to get comfortable with input/output.",
      topic: "Python",
      order: 1,
      pointsReward: 150,
      iconKey: "code",
      isPublished: true,
    })
    .returning();

  const [reverseStep] = await getDb()
    .insert(academyQuestSteps)
    .values({ questId: pyWarmup.id, order: 0, title: "Reverse a string", type: "coding_challenge", content: "" })
    .returning();

  await getDb().insert(academyCodingChallenges).values({
    stepId: reverseStep.id,
    prompt: "Read a single line from stdin and print it reversed.",
    difficulty: "easy",
    starterCode: JSON.stringify({
      python: "s = input()\n\n",
      javascript: 'const s = require("fs").readFileSync(0, "utf8").trim();\n\n',
      java: "import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String s = sc.nextLine();\n\n  }\n}\n",
      cpp: "#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n  string s;\n  getline(cin, s);\n\n  return 0;\n}\n",
    }),
    testCases: JSON.stringify([
      { stdin: "hello", expectedStdout: "olleh", hidden: false },
      { stdin: "chiromo", expectedStdout: "omorihc", hidden: true },
      { stdin: "a", expectedStdout: "a", hidden: true },
    ]),
  });

  const [fizzStep] = await getDb()
    .insert(academyQuestSteps)
    .values({ questId: pyWarmup.id, order: 1, title: "FizzBuzz", type: "coding_challenge", content: "" })
    .returning();

  await getDb().insert(academyCodingChallenges).values({
    stepId: fizzStep.id,
    prompt:
      "Read an integer n from stdin. Print numbers 1 to n, one per line — but print 'Fizz' for multiples of 3, " +
      "'Buzz' for multiples of 5, and 'FizzBuzz' for multiples of both.",
    difficulty: "medium",
    starterCode: JSON.stringify({
      python: "n = int(input())\n\n",
      javascript: 'const n = parseInt(require("fs").readFileSync(0, "utf8").trim());\n\n',
      java: "import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int n = sc.nextInt();\n\n  }\n}\n",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int n;\n  cin >> n;\n\n  return 0;\n}\n",
    }),
    testCases: JSON.stringify([
      { stdin: "5", expectedStdout: "1\n2\nFizz\n4\nBuzz", hidden: false },
      { stdin: "15", expectedStdout: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", hidden: true },
      { stdin: "1", expectedStdout: "1", hidden: true },
    ]),
    timeLimitMs: 5000,
  });

  // ───────────────────────── Quest 2: SQL Fundamentals ────────────────────
  const [sqlQuest] = await getDb()
    .insert(academyQuests)
    .values({
      slug: "sql-fundamentals",
      title: "SQL Fundamentals",
      description: "Query a real database, right in your browser.",
      topic: "Databases",
      order: 2,
      pointsReward: 150,
      iconKey: "database",
      isPublished: true,
    })
    .returning();

  const [activeMembersStep] = await getDb()
    .insert(academyQuestSteps)
    .values({ questId: sqlQuest.id, order: 0, title: "Find active members", type: "sql_challenge", content: "" })
    .returning();

  await getDb().insert(academySqlChallenges).values({
    stepId: activeMembersStep.id,
    prompt: "Return the name and email of every member with status = 'active', ordered by name.",
    difficulty: "easy",
    setupSql: `
      CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, email TEXT, status TEXT);
      INSERT INTO members VALUES
        (1, 'Amina', 'amina@chiromo.dev', 'active'),
        (2, 'Brian', 'brian@chiromo.dev', 'inactive'),
        (3, 'Cynthia', 'cynthia@chiromo.dev', 'active'),
        (4, 'Derek', 'derek@chiromo.dev', 'inactive');
    `,
    expectedResult: JSON.stringify([
      { name: "Amina", email: "amina@chiromo.dev" },
      { name: "Cynthia", email: "cynthia@chiromo.dev" },
    ]),
  });

  const [countByTeamStep] = await getDb()
    .insert(academyQuestSteps)
    .values({ questId: sqlQuest.id, order: 1, title: "Count members per team", type: "sql_challenge", content: "" })
    .returning();

  await getDb().insert(academySqlChallenges).values({
    stepId: countByTeamStep.id,
    prompt: "Return each team's name and how many members it has, ordered by member count descending.",
    difficulty: "medium",
    setupSql: `
      CREATE TABLE teams (id INTEGER PRIMARY KEY, name TEXT);
      CREATE TABLE team_members (team_id INTEGER, member_name TEXT);
      INSERT INTO teams VALUES (1, 'Web'), (2, 'AI'), (3, 'Design');
      INSERT INTO team_members VALUES
        (1, 'Amina'), (1, 'Brian'), (1, 'Cynthia'),
        (2, 'Derek'), (2, 'Amina'),
        (3, 'Brian');
    `,
    expectedResult: JSON.stringify([
      { name: "Web", count: 3 },
      { name: "AI", count: 2 },
      { name: "Design", count: 1 },
    ]),
  });

  // ───────────────────────── Quest 3: Algorithms Deep Dive ────────────────
  const [algo] = await getDb()
    .insert(academyQuests)
    .values({
      slug: "algorithms-deep-dive",
      title: "Algorithms Deep Dive",
      description: "The classics — where things start to actually get hard.",
      topic: "Algorithms",
      order: 3,
      pointsReward: 250,
      iconKey: "rocket",
      isPublished: true,
    })
    .returning();

  const [twoSumStep] = await getDb()
    .insert(academyQuestSteps)
    .values({ questId: algo.id, order: 0, title: "Two Sum", type: "coding_challenge", content: "" })
    .returning();

  await getDb().insert(academyCodingChallenges).values({
    stepId: twoSumStep.id,
    prompt:
      "First line: space-separated integers (the array). Second line: the target integer. " +
      "Print the two 0-indexed positions (space-separated) of the two numbers that add up to target. Assume exactly one solution.",
    difficulty: "hard",
    starterCode: JSON.stringify({
      python: "nums = list(map(int, input().split()))\ntarget = int(input())\n\n",
      javascript:
        'const lines = require("fs").readFileSync(0, "utf8").trim().split("\\n");\nconst nums = lines[0].split(" ").map(Number);\nconst target = parseInt(lines[1]);\n\n',
      java: "import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String[] parts = sc.nextLine().split(\" \");\n    int[] nums = new int[parts.length];\n    for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n    int target = Integer.parseInt(sc.nextLine());\n\n  }\n}\n",
      cpp: "#include <iostream>\n#include <sstream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  string line;\n  getline(cin, line);\n  vector<int> nums;\n  stringstream ss(line);\n  int x;\n  while (ss >> x) nums.push_back(x);\n  int target;\n  cin >> target;\n\n  return 0;\n}\n",
    }),
    testCases: JSON.stringify([
      { stdin: "2 7 11 15\n9", expectedStdout: "0 1", hidden: false },
      { stdin: "3 2 4\n6", expectedStdout: "1 2", hidden: true },
      { stdin: "3 3\n6", expectedStdout: "0 1", hidden: true },
    ]),
  });

  console.log("Done — 4 quests seeded: programming-basics, python-warmup, sql-fundamentals, algorithms-deep-dive");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });