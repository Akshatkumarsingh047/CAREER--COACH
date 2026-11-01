import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string({
    required_error: "Please select an industry",
  }),
  subIndustry: z.string({
    required_error: "Please select a specialization",
  }),
  bio: z.string().max(500).optional(),
  experience: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience cannot exceed 50 years")
    ),
  skills: z.string().transform((val) =>
    val
      ? val
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : undefined
  ),
});

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
  );

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});


// ---------- Job Tracker ----------
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^https?:\/\//i.test(v), "Must start with http:// or https://");

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(160),
  domain: z.string().min(1, "Select a domain"),
  portal: z.string().min(1, "Select where you applied"),
  status: z
    .enum(["saved", "applied", "oa", "interview", "offer", "rejected", "withdrawn"])
    .default("applied"),
  appliedOn: z.string().min(1, "Date is required"),
  jobUrl: optionalUrl,
  location: z.string().trim().max(120).optional(),
  salary: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(2000).optional(),
  source: z.enum(["manual", "feed"]).default("manual"),
});

export const activitySchema = z.object({
  domain: z.string().min(1, "Select a domain"),
  type: z.string().min(1, "Select an activity type"),
  title: z.string().trim().min(1, "Title is required").max(160),
  doneOn: z.string().min(1, "Date is required"),
  durationMins: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0 && v <= 1440), "0–1440 minutes"),
  link: optionalUrl,
  notes: z.string().trim().max(2000).optional(),
});
