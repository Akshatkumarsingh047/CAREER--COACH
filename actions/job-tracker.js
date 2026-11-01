"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/getAuthUser";
import { applicationSchema, activitySchema } from "@/app/lib/schema";

const refresh = () => revalidatePath("/job-tracker");

// ---------------- Applications ----------------

export async function getApplications() {
  const user = await getAuthUser();
  return db.jobApplication.findMany({
    where: { userId: user.id },
    orderBy: { appliedOn: "desc" },
  });
}

export async function createApplication(input) {
  const user = await getAuthUser();
  const data = applicationSchema.parse(input);

  const created = await db.jobApplication.create({
    data: { ...data, appliedOn: new Date(data.appliedOn), userId: user.id },
  });
  refresh();
  return created;
}

export async function updateApplicationStatus(id, status) {
  const user = await getAuthUser();
  const parsed = applicationSchema.shape.status.parse(status);

  const updated = await db.jobApplication.update({
    where: { id, userId: user.id },
    data: { status: parsed },
  });
  refresh();
  return updated;
}

export async function deleteApplication(id) {
  const user = await getAuthUser();
  await db.jobApplication.delete({ where: { id, userId: user.id } });
  refresh();
  return { success: true };
}

// ---------------- Activities ----------------

export async function getActivities() {
  const user = await getAuthUser();
  return db.activity.findMany({
    where: { userId: user.id },
    orderBy: { doneOn: "desc" },
  });
}

export async function createActivity(input) {
  const user = await getAuthUser();
  const data = activitySchema.parse(input);

  const created = await db.activity.create({
    data: { ...data, doneOn: new Date(data.doneOn), userId: user.id },
  });
  refresh();
  return created;
}

export async function deleteActivity(id) {
  const user = await getAuthUser();
  await db.activity.delete({ where: { id, userId: user.id } });
  refresh();
  return { success: true };
}
