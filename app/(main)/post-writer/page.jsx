import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostGenerator from "./_components/post-generator";

export default function PostWriterPage() {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-2">
        <h1 className="text-6xl font-bold gradient-title">Post Writer</h1>
        <Link href="/job-tracker">
          <Button variant="outline">
            <ClipboardList className="h-4 w-4 mr-2" />
            Job Tracker
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground mb-6">
        Turn your week of applications, practice and quizzes into a ready-to-post
        update for LinkedIn or X. It only uses what you&apos;ve logged.
      </p>

      <PostGenerator />
    </div>
  );
}
