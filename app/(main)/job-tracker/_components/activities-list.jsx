"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activitySchema } from "@/app/lib/schema";
import { createActivity, deleteActivity } from "@/actions/job-tracker";
import { activityTypes, domains } from "@/data/jobTracker";
import useFetch from "@/hooks/use-fetch";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function ActivityForm({ defaultDomain }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { loading, fn: saveFn } = useFetch(createActivity);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: { domain: defaultDomain, doneOn: format(new Date(), "yyyy-MM-dd") },
  });

  const onSubmit = async (values) => {
    await saveFn(values);
    toast.success("Activity saved");
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Activity</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Log an activity</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Title" error={errors.title?.message}>
            <Input placeholder="Solved 3 DP problems on LeetCode" {...register("title")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Domain" error={errors.domain?.message}>
              <Select value={watch("domain")} onValueChange={(v) => setValue("domain", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{domains.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
              </Select>
            </Field>
            <Field label="Type" error={errors.type?.message}>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>{activityTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" error={errors.doneOn?.message}>
              <Input type="date" {...register("doneOn")} />
            </Field>
            <Field label="Minutes (optional)" error={errors.durationMins?.message}>
              <Input type="number" min="0" placeholder="45" {...register("durationMins")} />
            </Field>
          </div>
          <Field label="Link (optional)" error={errors.link?.message}>
            <Input placeholder="https://…" {...register("link")} />
          </Field>
          <Field label="Notes (optional)" error={errors.notes?.message}>
            <Textarea rows={3} {...register("notes")} />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save activity"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ActivitiesList({ activities, defaultDomain }) {
  const router = useRouter();

  const remove = async (id) => {
    try {
      await deleteActivity(id);
      toast.success("Activity removed");
      router.refresh();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end"><ActivityForm defaultDomain={defaultDomain} /></div>

      {!activities.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No activities yet</CardTitle>
            <CardDescription>Track practice sessions, mock interviews, networking and more.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        activities.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {format(new Date(a.doneOn), "PPP")}
                    {a.durationMins ? ` · ${a.durationMins} min` : ""}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{a.domain}</Badge>
                  <Badge variant="outline">{a.type}</Badge>
                  {a.link && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={a.link} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={() => remove(a.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {a.notes && (
              <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{a.notes}</p></CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
