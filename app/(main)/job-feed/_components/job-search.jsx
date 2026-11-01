"use client";

import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { searchJobs } from "@/actions/job-feed";
import { jobSources } from "@/data/jobTracker";
import useFetch from "@/hooks/use-fetch";
import JobCard from "./job-card";

export default function JobSearch({ defaultKeyword }) {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [location, setLocation] = useState("");
  const [sources, setSources] = useState(jobSources.map((s) => s.id));
  const { data, loading, fn: runSearch } = useFetch(searchJobs);

  const toggle = (id) =>
    setSources((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch({ keyword, location, sources });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title or skill (e.g. SDE, React, Data Analyst)"
                className="flex-1"
              />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Bengaluru)"
                className="md:w-60"
              />
              <Button type="submit" disabled={loading || !keyword.trim()}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {jobSources.map((s) => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sources.includes(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Portals without an API: open the search there */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search on other portals</CardTitle>
              <CardDescription>
                Naukri, LinkedIn & others don&apos;t offer a public jobs API — these links open
                the same search there. Log the application in your tracker afterwards.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.portalLinks.map((p) => (
                <Button key={p.name} variant="outline" size="sm" asChild>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.name}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>

          {data.errors.length > 0 && (
            <p className="text-sm text-amber-400">
              Couldn&apos;t reach: {data.errors.map((e) => `${e.source} (${e.message})`).join(", ")}
            </p>
          )}

          <p className="text-sm text-muted-foreground">{data.jobs.length} listings</p>
          <div className="space-y-4">
            {data.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {!data.jobs.length && (
              <Card>
                <CardHeader>
                  <CardTitle>No listings found</CardTitle>
                  <CardDescription>Try a broader keyword or use the portal links above.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
