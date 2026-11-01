"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/getAuthUser";
import { getUserStats } from "@/lib/career-stats";
import { buildRows, MIN_COHORT } from "@/lib/benchmark-math";
import { model } from "@/lib/gemini";

const DAY = 24 * 60 * 60 * 1000;
const PAST_APPLIED = ["oa", "interview", "offer"];

async function compute(user) {
  const since = new Date(Date.now() - 30 * DAY);
  const mine = await getUserStats(user.id, 30);

  // Peers: opted-in users in the same top-level industry (e.g. "tech").
  const prefix = user.industry?.split("-")[0];
  const peers = await db.user.findMany({
    where: {
      shareBenchmark: true,
      id: { not: user.id },
      ...(prefix ? { industry: { startsWith: `${prefix}-` } } : {}),
    },
    select: { id: true },
    take: 5000,
  });
  const ids = peers.map((p) => p.id);

  const real = { applications: [], activities: [], avgQuiz: [], responseRate: [] };

  if (ids.length >= MIN_COHORT) {
    const [appGroups, actGroups, quizGroups] = await Promise.all([
      db.jobApplication.groupBy({
        by: ["userId", "status"],
        where: { userId: { in: ids }, appliedOn: { gte: since }, status: { not: "saved" } },
        _count: { _all: true },
      }),
      db.activity.groupBy({
        by: ["userId"],
        where: { userId: { in: ids }, doneOn: { gte: since } },
        _count: { _all: true },
      }),
      db.assessment.groupBy({
        by: ["userId"],
        where: { userId: { in: ids }, createdAt: { gte: since } },
        _avg: { quizScore: true },
      }),
    ]);

    const total = new Map();
    const adv = new Map();
    for (const g of appGroups) {
      total.set(g.userId, (total.get(g.userId) || 0) + g._count._all);
      if (PAST_APPLIED.includes(g.status)) {
        adv.set(g.userId, (adv.get(g.userId) || 0) + g._count._all);
      }
    }
    const acts = new Map(actGroups.map((g) => [g.userId, g._count._all]));
    const quiz = new Map(quizGroups.map((g) => [g.userId, g._avg.quizScore]));

    for (const id of ids) {
      const t = total.get(id) || 0;
      real.applications.push(t);
      real.activities.push(acts.get(id) || 0);
      if (quiz.get(id) != null) real.avgQuiz.push(Math.round(quiz.get(id)));
      if (t >= 3) real.responseRate.push(Math.round(((adv.get(id) || 0) / t) * 100));
    }
  }

  return {
    rows: buildRows(mine, real),
    cohortSize: ids.length,
    optedIn: user.shareBenchmark,
  };
}

export async function getBenchmark() {
  const user = await getAuthUser();
  return compute(user);
}

export async function setBenchmarkOptIn(value) {
  const user = await getAuthUser();
  await db.user.update({
    where: { id: user.id },
    data: { shareBenchmark: !!value },
  });
  revalidatePath("/benchmark");
  return { optedIn: !!value };
}

export async function getBenchmarkInsight() {
  const user = await getAuthUser();
  const { rows, cohortSize } = await compute(user);

  if (rows.every((r) => r.mine == null || r.mine === 0)) {
    throw new Error("Log some applications or activities first, then ask for insights.");
  }

  const lines = rows
    .map(
      (r) =>
        `- ${r.label} (${r.sub}): you ${r.mine ?? "no data"}${r.unit}, typical (median) ${r.median}${r.unit}, percentile ${r.percentile ?? "n/a"}${r.sample ? " [vs illustrative sample data]" : ""}`
    )
    .join("\n");

  const prompt = `
    You are a supportive, practical career coach. A job seeker in the "${user.industry || "general"}" field
    (${user.experience ?? "unknown"} years experience) has these stats for the last 30 days, compared with peers
    (${cohortSize} real peers opted in; rows marked "sample data" compare against illustrative numbers, not real users):

    ${lines}

    Write 3–4 short sentences: what they are doing well, the ONE metric to improve first, and one concrete action for this week.
    Rules: use only the numbers above, never invent data, no bullet lists, no headings, plain text, encouraging but honest.
    If a row is marked sample data, mention once that comparisons will get more accurate as more people join.
  `;

  try {
    const result = await model.generateContent(prompt);
    return { text: result.response.text().trim() };
  } catch (e) {
    console.error("Benchmark insight failed:", e.message);
    throw new Error("Could not generate insight right now. Try again in a moment.");
  }
}
