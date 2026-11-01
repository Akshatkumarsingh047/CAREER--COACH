// Deep links into portals that have no public API (Naukri, LinkedIn, Indeed...).
// We only build the search URL — the user searches & applies on the portal,
// then logs it in the tracker.

const slug = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function buildPortalLinks({ keyword, location = "" }) {
  const k = keyword?.trim() || "software developer";
  const kq = encodeURIComponent(k);
  const lq = encodeURIComponent(location);
  const ks = slug(k);
  const ls = slug(location);

  return [
    {
      name: "Naukri",
      url: `https://www.naukri.com/${ks}-jobs${ls ? `-in-${ls}` : ""}`,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/jobs/search/?keywords=${kq}${
        location ? `&location=${lq}` : ""
      }`,
    },
    {
      name: "Indeed",
      url: `https://in.indeed.com/jobs?q=${kq}${location ? `&l=${lq}` : ""}`,
    },
    {
      name: "Internshala",
      url: `https://internshala.com/jobs/${ks}-jobs${ls ? `-in-${ls}` : ""}`,
    },
    {
      name: "Wellfound",
      url: `https://wellfound.com/jobs?q=${kq}`,
    },
    {
      name: "Glassdoor",
      url: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${kq}`,
    },
  ];
}
