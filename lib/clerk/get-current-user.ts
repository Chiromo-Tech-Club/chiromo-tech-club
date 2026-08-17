// import { auth } from "@/lib/clerk/client";
// import { getDb } from "@/lib/drizzle/client";
// import { members, memberCommunities } from "@/lib/drizzle/schema";
// import { eq, isNull, and } from "drizzle-orm";
// import type { Member } from "@/types/member";

// /**
//  * Resolves the signed-in Clerk user to our own `members` row. Returns null
//  * for signed-out visitors and for Clerk users who haven't completed the
//  * "join the club" flow yet (no matching member record).
//  */
// export async function getCurrentMember(): Promise<Member | null> {
//   const { userId } = await auth();
//   if (!userId) return null;

//   const db = getDb();
//   const [row] = await db
//     .select()
//     .from(members)
//     .where(and(eq(members.clerkUserId, userId), isNull(members.deletedAt)))
//     .limit(1);

//   if (!row) return null;

//   const communityRows = await db
//     .select({ communitySlug: memberCommunities.communitySlug })
//     .from(memberCommunities)
//     .where(eq(memberCommunities.memberId, row.id));

//   return {
//     id: row.id,
//     clerkUserId: row.clerkUserId,
//     fullName: row.fullName,
//     email: row.email,
//     role: row.role,
//     execTitle: row.execTitle,
//     communitySlugs: communityRows.map((c) => c.communitySlug),
//     avatarUrl: row.avatarUrl,
//     bio: row.bio,
//     githubHandle: row.githubHandle,
//     createdAt: row.createdAt.toISOString(),
//     updatedAt: row.updatedAt.toISOString(),
//     deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
//   };
// }
