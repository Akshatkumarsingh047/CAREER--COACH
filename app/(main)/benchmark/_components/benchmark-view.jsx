"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBenchmarkInsight, setBenchmarkOptIn } from "@/actions/benchmark";
import useFetch from "@/hooks/use-fetch";

function label(p) {
  if (p == null) return "Not enough data yet";
  if (p >= 90) return "Top 10%";
  if (p >= 75) return "Top 25%";
  if (p >= 50) return "Above average";
  if (p >= 25) return "Below average";
  return "Just getting started";
}

export default function BenchmarkView({ benchmark }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { data: insight, loading, fn: askInsight } = useFetch(getBenchmarkInsight);

  const { rows, cohortSize, optedIn } = benchmark;
  const anySample = rows.some((r) => r.sample);

  const toggleOptIn = async (checked) => {
    setSaving(true);
    try {
      await setBenchmarkOptIn(checked);
      toast.success(checked ? "You're now part of the benchmark" : "Removed from the benchmark");
      router.refresh();
    } catch (e) {
      toast.error(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-medium">Include my anonymous stats in peer benchmarks</p>
            <p className="text-sm text-muted-foreground">
              Only counts (e.g. applications this month) are used — never names,
              companies or notes. You can turn this off anytime.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={optedIn}
              disabled={saving}
              onChange={(e) => toggleOptIn(e.target.checked)}
            />
            {optedIn ? "Sharing" : "Not sharing"}
          </label>
        </CardContent>
      </Card>

      {anySample && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          Only {cohortSize} real peer{cohortSize === 1 ? "" : "s"} in your field so far, so
          rows marked <b>Sample data</b> are compared with illustrative numbers, not real users.
          They switch to real peers automatically once 20+ people opt in.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <Card key={r.key}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{r.label}</CardTitle>
                  <CardDescription>{r.sub}</CardDescription>
                </div>
                {r.sample && <Badge variant="outline">Sample data</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">
                  {r.mine == null ? "—" : `${r.mine}${r.unit}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  typical: {r.median}
                  {r.unit}
                </div>
              </div>
              <Progress value={r.percentile ?? 0} />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {r.percentile == null ? "" : `${r.percentile}th percentile`}
                </span>
                <span className="font-medium">{label(r.percentile)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI coach insight</CardTitle>
          <CardDescription>A short, personal read of the numbers above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insight?.text && <p className="leading-relaxed">{insight.text}</p>}
          <Button onClick={() => askInsight()} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Thinking…" : insight ? "Refresh insight" : "Get my insight"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
