"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationSchema } from "@/app/lib/schema";
import { createApplication } from "@/actions/job-tracker";
import { domains, portals, statuses } from "@/data/jobTracker";
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

export default function ApplicationForm({ defaultDomain = "Technical" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { loading, fn: saveFn } = useFetch(createApplication);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      domain: defaultDomain,
      status: "applied",
      appliedOn: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (values) => {
    await saveFn(values);
    toast.success("Application saved");
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log an application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" error={errors.company?.message}>
              <Input placeholder="Amazon" {...register("company")} />
            </Field>
            <Field label="Role" error={errors.role?.message}>
              <Input placeholder="SDE 1" {...register("role")} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Domain" error={errors.domain?.message}>
              <Select value={watch("domain")} onValueChange={(v) => setValue("domain", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Applied via" error={errors.portal?.message}>
              <Select value={watch("portal")} onValueChange={(v) => setValue("portal", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Portal" /></SelectTrigger>
                <SelectContent>
                  {portals.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" error={errors.appliedOn?.message}>
              <Input type="date" {...register("appliedOn")} />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location (optional)">
              <Input placeholder="Bengaluru" {...register("location")} />
            </Field>
            <Field label="Salary (optional)">
              <Input placeholder="₹18 LPA" {...register("salary")} />
            </Field>
          </div>

          <Field label="Job link (optional)" error={errors.jobUrl?.message}>
            <Input placeholder="https://…" {...register("jobUrl")} />
          </Field>

          <Field label="Notes (optional)" error={errors.notes?.message}>
            <Textarea rows={3} placeholder="Referral from…, round dates, recruiter name" {...register("notes")} />
          </Field>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
