"use server";

import { getAuthUser } from "@/lib/getAuthUser";
import { getUserStats } from "@/lib/career-stats";
import { model } from "@/lib/gemini";

const PLATFORMS = {
  linkedin: "a LinkedIn post (80–150 words, short lines with blank lines between them, at most 3 relevant hashtags at the end)",
  x: "a single X (Twitter) post of at most 270 characters, at most 2 hashtags",
};
const TONES = {
  humble: "humble and grateful",
  confident: "confident and motivating",
  funny: "light, self-deprecating and funny",
  story: "storytelling: a small lesson learned this period",
};

export async function generatePost({
  platform = "linkedin",
  tone = "humble",
  days = 7,
  includeCompanies = false,
}) {
  const user = await getAuthUser();

  if (!PLATFORMS[platform]) throw new Error("Invalid platform");
  if (!TONES[tone]) throw new Error("Invalid tone");
  const range = days === 30 ? 30 : 7;

  const stats = await getUserStats(user.id, range);

  if (!stats.applications && !stats.activities && !stats.quizzes) {
    throw new Error(
      `Nothing logged in the last ${range} days. Add applications or activities in Job Tracker first.`
    );
  }

  const facts = [
    stats.applications ? `Applications sent: ${stats.applications}` : null,
    stats.advanced ? `Applications that moved forward (online test/interview/offer): ${stats.advanced}` : null,
    stats.activities
      ? `Practice activities logged: ${stats.activities} (${Object.entries(stats.activityTypes)
          .map(([k, v]) => `${v} ${k}`)
          .join(", ")})`
      : null,
    stats.activityMinutes ? `Total practice time: ${stats.activityMinutes} minutes` : null,
    stats.activityTitles.length ? `Examples of what they did: ${stats.activityTitles.join("; ")}` : null,
    stats.quizzes ? `Interview quizzes taken: ${stats.quizzes}, average score ${stats.avgQuiz}%` : null,
    includeCompanies && stats.companies.length
      ? `Companies applied to (may be mentioned): ${stats.companies.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `
    Write ${PLATFORMS[platform]} for a job seeker${user.industry ? ` in ${user.industry.replace(/-/g, " ")}` : ""},
    summarising their last ${range} days of job search. Tone: ${TONES[tone]}.

    Facts (use ONLY these, never invent numbers, companies, offers or results):
    ${facts}

    Rules:
    - First person ("I").
    - ${includeCompanies ? "You may mention the listed companies." : "Do NOT mention any company names."}
    - Do not claim anything that is not in the facts (no "got an offer" unless listed).
    - Start with a hook line, end with a short question or takeaway.
    - Return ONLY the post text, no quotes, no preamble.
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (platform === "x" && text.length > 280) text = text.slice(0, 277) + "…";
    return { text, stats };
  } catch (e) {
    console.error("Post generation failed:", e.message);
    throw new Error("Could not generate the post right now. Try again in a moment.");
  }
}
