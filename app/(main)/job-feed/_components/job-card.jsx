"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackFeedJob } from "@/actions/job-feed";

export default function JobCard({ job }) {
  const [status, setStatus] = useState(job.tracked);

  const track = async (next) => {
    try {
      await trackFeedJob(job, next);
      setStatus((prev) => (prev === "applied" ? prev : next));
      toast.success(next === "applied" ? "Logged as applied" : "Saved to tracker");
    } catch (e) {
      toast.error(e.message || "Could not save");
    }
  };

  // Open the posting, then ask — we can't know whether they actually applied.
  const apply = () => {
    window.open(job.url, "_blank", "noopener,noreferrer");
    if (status === "applied") return;
    toast(`Did you apply to ${job.company}?`, {
      duration: 15000,
      action: { label: "Yes, log it", onClick: () => track("applied") },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl gradient-title">{job.title}</CardTitle>
            <CardDescription className="mt-1">
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
              {job.postedAt ? ` · ${formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}` : ""}
              {job.salary ? ` · ${job.salary}` : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary">{job.source}</Badge>
            {job.remote && <Badge variant="outline">Remote</Badge>}
            {status === "applied" ? (
              <Badge>Applied</Badge>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => track("saved")}
                disabled={status === "saved"}
                aria-label="Save job"
              >
                {status === "saved" ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            )}
            <Button size="sm" onClick={apply}>
              Apply <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {job.snippet && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{job.snippet}</p>
        </CardContent>
      )}
    </Card>
  );
}
