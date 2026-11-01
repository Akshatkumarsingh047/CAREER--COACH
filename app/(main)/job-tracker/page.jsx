import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApplications, getActivities } from "@/actions/job-tracker";
import TrackerView from "./_components/tracker-view";

export default async function JobTrackerPage() {
  const [applications, activities] = await Promise.all([
    getApplications(),
    getActivities(),
  ]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">Job Tracker</h1>
        <Link href="/job-feed">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Find Jobs
          </Button>
        </Link>
      </div>

      <TrackerView applications={applications} activities={activities} />
    </div>
  );
}
