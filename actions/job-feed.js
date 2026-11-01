"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/getAuthUser";
import { fetchJobs } from "@/lib/jobs/providers";
import { buildPortalLinks } from "@/lib/jobs/portal-links";

/**
 * Search the live job APIs + build deep links for the portals without an API.
 * Each job is annotated with `tracked` (the status, if the user already
 * saved/applied to the same URL) so the UI can show it.
 */
export async function searchJobs({ keyword, location = "", sources }) {
  const user = await getAuthUser();

  const kw = (keyword || "").trim();
  if (!kw) throw new Error("Enter a job title or keyword");

  const [{ jobs, errors }, mine] = await Promise.all([
    fetchJobs({ keyword: kw, location: location.trim(), sources }),
    db.jobApplication.findMany({
      where: { userId: user.id, jobUrl: { not: null } },
      select: { jobUrl: true, status: true },
    }),
  ]);

  const trackedByUrl = new Map(mine.map((m) => [m.jobUrl, m.status]));

  return {
    jobs: jobs.map((j) => ({ ...j, tracked: trackedByUrl.get(j.url) || null })),
    errors,
    portalLinks: buildPortalLinks({ keyword: kw, location }),
  };
}

/**
 * Save a feed job into the tracker. status = "saved" (bookmark) or "applied".
 * If the user already tracks this URL we just update its status.
 */
export async function trackFeedJob(job, status = "saved", domain = "Technical") {
  const user = await getAuthUser();
  if (!["saved", "applied"].includes(status)) throw new Error("Invalid status");
  if (!job?.url || !job?.title) throw new Error("Invalid job");

  const existing = await db.jobApplication.findFirst({
    where: { userId: user.id, jobUrl: job.url },
  });

  let record;
  if (existing) {
    // never downgrade e.g. "interview" back to "applied"
    const rank = { saved: 0, applied: 1 };
    record =
      rank[status] > (rank[existing.status] ?? 99)
        ? await db.jobApplication.update({
            where: { id: existing.id },
            data: { status, appliedOn: new Date() },
          })
        : existing;
  } else {
    record = await db.jobApplication.create({
      data: {
        userId: user.id,
        company: job.company || "Unknown",
        role: job.title,
        domain,
        portal: job.source || "Other",
        jobUrl: job.url,
        location: job.location || null,
        salary: job.salary || null,
        status,
        source: "feed",
      },
    });
  }

  revalidatePath("/job-tracker");
  return record;
}
