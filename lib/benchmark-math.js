// Pure helpers + sample data for Peer Benchmark (no DB, easy to test).

export const MIN_COHORT = 20; // real peers needed before we trust the numbers

export const METRICS = [
  { key: "applications", label: "Applications sent", sub: "last 30 days", unit: "" },
  { key: "activities", label: "Practice activities", sub: "last 30 days", unit: "" },
  { key: "avgQuiz", label: "Average quiz score", sub: "last 30 days", unit: "%" },
  { key: "responseRate", label: "Response rate", sub: "applications that moved forward", unit: "%" },
];

// Illustrative distributions used when too few real peers have opted in.
// They are NOT real user data and the UI labels them "sample data".
export const SAMPLE = {
  applications: [0, 1, 2, 3, 4, 5, 6, 8, 8, 10, 12, 12, 15, 18, 20, 22, 25, 30, 35, 45],
  activities: [0, 0, 1, 2, 3, 3, 4, 5, 6, 8, 8, 10, 12, 14, 15, 18, 20, 24, 28, 35],
  avgQuiz: [35, 42, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 92, 96],
  responseRate: [0, 0, 5, 8, 10, 10, 12, 14, 15, 18, 20, 22, 25, 28, 30, 33, 38, 42, 50, 60],
};

/** Percentile rank 0–100 of `value` within `values` (ties count half). */
export function percentile(value, values) {
  if (value == null || !values.length) return null;
  let below = 0;
  let equal = 0;
  for (const v of values) {
    if (v < value) below++;
    else if (v === value) equal++;
  }
  return Math.round(((below + 0.5 * equal) / values.length) * 100);
}

export function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 10) / 10;
}

/** Turn "mine" + distributions into the rows the UI renders. */
export function buildRows(mine, real) {
  return METRICS.map((m) => {
    const realValues = real[m.key] || [];
    const sample = realValues.length < MIN_COHORT;
    const values = sample ? SAMPLE[m.key] : realValues;
    const v = mine[m.key];
    return {
      ...m,
      mine: v,
      percentile: percentile(v, values),
      median: median(values),
      sample,
    };
  });
}
