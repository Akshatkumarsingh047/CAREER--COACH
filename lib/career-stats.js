import { db } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;
const PAST_APPLIED = ["oa", "interview", "offer"]; // got a response / moved forward

function tally(items, pick) {
  const out = {};
  for (const it of items) {
    const k = pick(it);
    if (k) out[k] = (out[k] || 0) + 1;
  }
  return out;
}

/** Summary of what one user logged in the last `days` days. */
export async function getUserStats(userId, days = 30) {
  const since = new Date(Date.now() - days * DAY);

  const [apps, acts, quizzes] = await Promise.all([
    db.jobApplication.findMany({
      where: { userId, appliedOn: { gte: since } },
      select: { company: true, role: true, portal: true, status: true },
    }),
    db.activity.findMany({
      where: { userId, doneOn: { gte: since } },
      select: { type: true, title: true, durationMins: true },
    }),
    db.assessment.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { quizScore: true },
    }),
  ]);

  const applied = apps.filter((a) => a.status !== "saved");
  const advanced = applied.filter((a) => PAST_APPLIED.includes(a.status));

  return {
    days,
    applications: applied.length,
    advanced: advanced.length,
    // only meaningful with a few applications
    responseRate:
      applied.length >= 3 ? Math.round((advanced.length / applied.length) * 100) : null,
    byStatus: tally(applied, (a) => a.status),
    byPortal: tally(applied, (a) => a.portal),
    companies: [...new Set(applied.map((a) => a.company))].slice(0, 5),
    activities: acts.length,
    activityMinutes: acts.reduce((s, a) => s + (a.durationMins || 0), 0),
    activityTypes: tally(acts, (a) => a.type),
    activityTitles: acts.slice(0, 5).map((a) => a.title),
    quizzes: quizzes.length,
    avgQuiz: quizzes.length
      ? Math.round(quizzes.reduce((s, q) => s + q.quizScore, 0) / quizzes.length)
      : null,
  };
}
