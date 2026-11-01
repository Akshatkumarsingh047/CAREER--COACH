"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteApplication, updateApplicationStatus } from "@/actions/job-tracker";
import { statuses } from "@/data/jobTracker";
import ApplicationForm from "./application-form";

export default function ApplicationsList({ applications, defaultDomain }) {
  const router = useRouter();

  const changeStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      toast.success("Status updated");
      router.refresh();
    } catch (e) {
      toast.error(e.message || "Failed to update");
    }
  };

  const remove = async (id) => {
    try {
      await deleteApplication(id);
      toast.success("Application removed");
      router.refresh();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <ApplicationForm defaultDomain={defaultDomain} />
      </div>

      {!applications.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription>
              Log a job you applied to, or save one from the Job Feed.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        applications.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl gradient-title">
                    {a.role} at {a.company}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    via {a.portal} · {format(new Date(a.appliedOn), "PPP")}
                    {a.location ? ` · ${a.location}` : ""}
                    {a.salary ? ` · ${a.salary}` : ""}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{a.domain}</Badge>
                  <Select value={a.status} onValueChange={(v) => changeStatus(a.id, v)}>
                    <SelectTrigger className="w-36 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {a.jobUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" aria-label="Open job posting">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {a.role} at {a.company} will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => remove(a.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            {a.notes && (
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{a.notes}</p>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
