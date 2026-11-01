import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/lib/getAuthUser";
import JobSearch from "./_components/job-search";

export default async function JobFeedPage() {
  const user = await getAuthUser();

  // "tech-software-development" -> "software development"
  const defaultKeyword = user.industry
    ? user.industry.split("-").slice(1).join(" ")
    : "";

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">Job Feed</h1>
        <Link href="/job-tracker">
          <Button variant="outline">
            <ClipboardList className="h-4 w-4 mr-2" />
            My Tracker
          </Button>
        </Link>
      </div>

      <JobSearch defaultKeyword={defaultKeyword} />
    </div>
  );
}
