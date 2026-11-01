"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { domains } from "@/data/jobTracker";
import StatsRow from "./stats-row";
import ApplicationsList from "./applications-list";
import ActivitiesList from "./activities-list";

export default function TrackerView({ applications, activities }) {
  const [domain, setDomain] = useState("all");

  const apps = domain === "all" ? applications : applications.filter((a) => a.domain === domain);
  const acts = domain === "all" ? activities : activities.filter((a) => a.domain === domain);

  return (
    <div className="space-y-6">
      <StatsRow applications={apps} activities={acts} />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Domain</span>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications ({apps.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({acts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <ApplicationsList applications={apps} defaultDomain={domain === "all" ? "Technical" : domain} />
        </TabsContent>
        <TabsContent value="activities">
          <ActivitiesList activities={acts} defaultDomain={domain === "all" ? "Technical" : domain} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
