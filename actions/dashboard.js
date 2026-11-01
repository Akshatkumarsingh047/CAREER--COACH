"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redirect } from "next/navigation";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const generateAIInsights = async (industry , skills) => {
 
 const prompt = `
  You are a career intelligence analyst. Analyze the current state of the ${industry} industry
  specifically for a professional with expertise in: ${Array.isArray(skills) ? skills.join(", ") : skills}.

  Provide insights in ONLY the following JSON format without any additional notes or explanations:
  {
    "salaryRanges": [
      { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
    ],
    "growthRate": number,
    "demandLevel": "High" | "Medium" | "Low",
    "topSkills": ["skill1", "skill2"],
    "marketOutlook": "Positive" | "Neutral" | "Negative",
    "keyTrends": ["trend1", "trend2"],
    "recommendedSkills": ["skill1", "skill2"]
  }

  IMPORTANT GUIDELINES:
  - Return ONLY the JSON. No additional text, notes, or markdown formatting.
  - salaryRanges: Include at least 5 roles RELEVANT to the ${industry} industry and the provided skills. Prioritize roles that match or are adjacent to: ${Array.isArray(skills) ? skills.join(", ") : skills}.
  - growthRate: A realistic percentage reflecting current ${industry} market growth.
  - topSkills: List the top 5+ most in-demand skills in ${industry}, highlighting which of the user's skills (${Array.isArray(skills) ? skills.join(", ") : skills}) are currently valuable.
  - recommendedSkills: Suggest 5+ skills the user should learn NEXT to complement their existing skills (${Array.isArray(skills) ? skills.join(", ") : skills}) and grow in ${industry}.
  - keyTrends: List 5+ trends currently shaping the ${industry} industry that directly impact professionals with these skills.
  - marketOutlook: Reflect demand for the specific skill set provided, not just the industry overall.
`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  
  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    if(!user.industry)
    {
      redirect("/onboarding")
      return;
    }
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
       nextUpdate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
