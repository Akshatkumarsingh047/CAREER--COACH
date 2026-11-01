import { Badge } from "@/components/ui/badge";
import { statuses } from "@/data/jobTracker";

export default function StatusBadge({ status }) {
  const s = statuses.find((x) => x.value === status);
  return (
    <Badge variant="outline" className={`border-transparent ${s?.className || ""}`}>
      {s?.label || status}
    </Badge>
  );
}
