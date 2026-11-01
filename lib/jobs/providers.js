// Job listing providers. All three expose official public APIs / feeds, so no
// scraping is involved (scraping Naukri/LinkedIn/Indeed violates their ToS and
// gets blocked). Every provider returns the same normalized shape:
//   { id, source, title, company, location, url, snippet, postedAt, salary, remote }

const TIMEOUT_MS = 8000;
const REVALIDATE_SECONDS = 1800; // cache upstream responses for 30 min

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(text, max = 240) {
  const clean = stripHtml(text);
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatSalary(min, max, currency = "") {
  if (!min && !max) return null;
  const f = (n) => Math.round(n).toLocaleString("en-IN");
  if (min && max) return `${currency}${f(min)} – ${currency}${f(max)}`;
  return `${currency}${f(min || max)}`;
}

// ---- Adzuna (needs free ADZUNA_APP_ID / ADZUNA_APP_KEY) -------------------
// https://developer.adzuna.com/ — country code "in" = India
async function adzuna({ keyword, location, limit }) {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) throw new Error("ADZUNA_APP_ID / ADZUNA_APP_KEY not set");

  const params = new URLSearchParams({
    app_id: id,
    app_key: key,
    results_per_page: String(limit),
    what: keyword,
    "content-type": "application/json",
  });
  if (location) params.set("where", location);

  const data = await getJson(
    `https://api.adzuna.com/v1/api/jobs/in/search/1?${params}`
  );
  return (data.results || []).map((j) => ({
    id: `adzuna-${j.id}`,
    source: "Adzuna",
    title: stripHtml(j.title),
    company: j.company?.display_name || "Unknown",
    location: j.location?.display_name || "",
    url: j.redirect_url,
    snippet: snippet(j.description),
    postedAt: j.created || null,
    salary: formatSalary(j.salary_min, j.salary_max, "₹"),
    remote: /remote/i.test(`${j.title} ${j.description}`),
  }));
}

// ---- Remotive (no key; remote jobs worldwide) -----------------------------
// https://remotive.com/api-documentation — please don't poll aggressively
async function remotive({ keyword, limit }) {
  const params = new URLSearchParams({ search: keyword, limit: String(limit) });
  const data = await getJson(`https://remotive.com/api/remote-jobs?${params}`);
  return (data.jobs || []).slice(0, limit).map((j) => ({
    id: `remotive-${j.id}`,
    source: "Remotive",
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || "Remote",
    url: j.url,
    snippet: snippet(j.description),
    postedAt: j.publication_date || null,
    salary: j.salary || null,
    remote: true,
  }));
}

// ---- Arbeitnow (no key; mostly Europe + remote) ---------------------------
// https://www.arbeitnow.com/api/job-board-api — no search param, so we filter.
async function arbeitnow({ keyword, location, limit }) {
  const data = await getJson("https://www.arbeitnow.com/api/job-board-api");
  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  const loc = (location || "").toLowerCase();

  return (data.data || [])
    .filter((j) => {
      const hay = `${j.title} ${j.company_name} ${(j.tags || []).join(" ")}`.toLowerCase();
      const kwOk = words.every((w) => hay.includes(w));
      const locOk = !loc || (j.location || "").toLowerCase().includes(loc) || j.remote;
      return kwOk && locOk;
    })
    .slice(0, limit)
    .map((j) => ({
      id: `arbeitnow-${j.slug}`,
      source: "Arbeitnow",
      title: j.title,
      company: j.company_name,
      location: j.location || (j.remote ? "Remote" : ""),
      url: j.url,
      snippet: snippet(j.description),
      postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
      salary: null,
      remote: !!j.remote,
    }));
}

const PROVIDERS = { adzuna, remotive, arbeitnow };

/**
 * Query the selected providers in parallel. One provider failing never breaks
 * the others — failures are returned in `errors` so the UI can show a notice.
 */
export async function fetchJobs({ keyword, location = "", sources, limit = 15 }) {
  const ids = (sources?.length ? sources : Object.keys(PROVIDERS)).filter(
    (s) => PROVIDERS[s]
  );

  const settled = await Promise.allSettled(
    ids.map((id) => PROVIDERS[id]({ keyword, location, limit }))
  );

  const jobs = [];
  const errors = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") jobs.push(...r.value);
    else errors.push({ source: ids[i], message: r.reason?.message || "failed" });
  });

  // newest first; undated last
  jobs.sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
  return { jobs: jobs.filter((j) => j.url), errors };
}
