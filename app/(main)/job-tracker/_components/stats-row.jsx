import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsRow({ applications, activities }) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const applied = applications.filter((a) => a.status !== "saved");

  const stats = [
    { label: "Applications", value: applied.length },
    {
      label: "Interviewing",
      value: applications.filter((a) => ["oa", "interview"].includes(a.status)).length,
    },
    { label: "Offers", value: applications.filter((a) => a.status === "offer").length },
    {
      label: "Activities (7 days)",
      value: activities.filter((a) => new Date(a.doneOn).getTime() >= weekAgo).length,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
