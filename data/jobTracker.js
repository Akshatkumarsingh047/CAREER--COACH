// Shared constants for the Job Tracker + Job Feed features.

export const domains = [
  "Technical",
  "Data & Analytics",
  "Product",
  "Design",
  "Marketing",
  "Finance",
  "Sales",
  "Operations",
  "Other",
];

export const portals = [
  "Naukri",
  "LinkedIn",
  "Indeed",
  "Internshala",
  "Wellfound",
  "Glassdoor",
  "Company Site",
  "Referral",
  "Adzuna",
  "Remotive",
  "Arbeitnow",
  "Other",
];

export const statuses = [
  { value: "saved", label: "Saved", className: "bg-slate-500/20 text-slate-300" },
  { value: "applied", label: "Applied", className: "bg-blue-500/20 text-blue-300" },
  { value: "oa", label: "Online Test", className: "bg-purple-500/20 text-purple-300" },
  { value: "interview", label: "Interview", className: "bg-amber-500/20 text-amber-300" },
  { value: "offer", label: "Offer", className: "bg-green-500/20 text-green-300" },
  { value: "rejected", label: "Rejected", className: "bg-red-500/20 text-red-300" },
  { value: "withdrawn", label: "Withdrawn", className: "bg-zinc-500/20 text-zinc-400" },
];

export const activityTypes = [
  "Coding Practice",
  "Mock Interview",
  "Course / Learning",
  "Networking",
  "Referral Request",
  "Resume Update",
  "Project Work",
  "Interview Round",
  "Other",
];

export const jobSources = [
  { id: "adzuna", label: "Adzuna (India)" },
  { id: "remotive", label: "Remotive (Remote)" },
  { id: "arbeitnow", label: "Arbeitnow" },
];
