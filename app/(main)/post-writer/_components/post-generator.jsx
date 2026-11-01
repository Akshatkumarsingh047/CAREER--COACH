"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePost } from "@/actions/post-writer";
import useFetch from "@/hooks/use-fetch";

const platforms = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
];
const tones = [
  { value: "humble", label: "Humble & grateful" },
  { value: "confident", label: "Confident" },
  { value: "funny", label: "Funny" },
  { value: "story", label: "Lesson learned" },
];
const ranges = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

export default function PostGenerator() {
  const [platform, setPlatform] = useState("linkedin");
  const [tone, setTone] = useState("humble");
  const [days, setDays] = useState("7");
  const [includeCompanies, setIncludeCompanies] = useState(false);
  const [text, setText] = useState("");

  const { data, loading, fn: run } = useFetch(generatePost);

  useEffect(() => {
    if (data?.text) setText(data.text);
  }, [data]);

  const generate = () =>
    run({ platform, tone, days: Number(days), includeCompanies });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy — select the text and copy manually");
    }
  };

  const shareUrl =
    platform === "x"
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      : `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;

  const stats = data?.stats;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 h-fit">
        <CardHeader>
          <CardTitle>Options</CardTitle>
          <CardDescription>Pick where you&apos;ll post and how it should sound.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tones.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Period</Label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ranges.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={includeCompanies}
              onChange={(e) => setIncludeCompanies(e.target.checked)}
            />
            Mention company names (off by default for privacy)
          </label>

          <Button className="w-full" onClick={generate} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Writing…" : text ? "Regenerate" : "Generate post"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Your post</CardTitle>
          <CardDescription>
            Edit freely — you review it before anything is posted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{stats.applications} applications</span>·
              <span>{stats.activities} activities</span>·
              <span>{stats.quizzes} quizzes</span>
              <span>(last {stats.days} days)</span>
            </div>
          )}

          <Textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Press “Generate post” to draft an update from your tracker data."
          />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`text-xs ${
                platform === "x" && text.length > 280 ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              {text.length}
              {platform === "x" ? " / 280" : " characters"}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copy} disabled={!text}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button asChild disabled={!text}>
                <a
                  href={text ? shareUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!text}
                >
                  Open {platform === "x" ? "X" : "LinkedIn"}
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
