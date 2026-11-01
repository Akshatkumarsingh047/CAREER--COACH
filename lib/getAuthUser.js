import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

// Resolve the signed-in DB user (creating it on first login) or throw.
export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) user = await checkUser();
  if (!user) throw new Error("User not found");

  return user;
}
