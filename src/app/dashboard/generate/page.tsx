"use client";

import { useState } from "react";
import { useCVStore } from "@/stores/cv-store";
import { useProfileStore } from "@/stores/profile-store";
import { useProjectsStore } from "@/stores/projects-store";
import { useSettingsStore } from "@/stores/settings-store";
import { GenerationProgress } from "@/components/cv/GenerationProgress";
import { ATSScoreGauge } from "@/components/cv/ATSScoreGauge";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Link,
  FileText,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  ChevronRight,
  Settings,
  PencilLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Recommendation } from "@/types/cv";
import NextLink from "next/link";

export default function GeneratePage() {
  const { aiProvider, apiKey, model, ollamaBaseUrl } = useSettingsStore();
  const { currentCV, isGenerating, generationStep, generationStepName, totalSteps, error, generateCV, reOptimize } =
    useCVStore();
  const profile = useProfileStore();
  const { projects } = useProjectsStore();

  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [scrapedText, setScrapedText] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const isAIConfigured = aiProvider === "ollama" || !!apiKey;
  const effectiveJobText = jobText || scrapedText;

  const handleExtractUrl = async () => {
    if (!jobUrl) return;
    setIsScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScrapedText(data.text);
    } catch (e: unknown) {
      setScrapeError(e instanceof Error ? e.message : "Failed to extract job");
    } finally {
      setIsScraping(false);
    }
  };

  const getLiveAIConfig = () => {
    const settings = useSettingsStore.getState();
    return {
      provider: settings.aiProvider,
      apiKey: settings.apiKey,
      model: settings.model,
      baseUrl: settings.ollamaBaseUrl,
    };
  };

  const handleGenerate = async () => {
    const liveConfig = getLiveAIConfig();
    const isConfigured = liveConfig.provider === 'ollama' || !!liveConfig.apiKey;
    if (!effectiveJobText || !isConfigured) return;
    await generateCV(effectiveJobText, profile, projects, liveConfig);
  };

  const handleReOptimize = async () => {
    if (!currentCV || currentCV.optimizationCount >= 3) return;
    const liveConfig = getLiveAIConfig();
    await reOptimize(liveConfig);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate CV</h1>
        <p className="text-muted-foreground mt-1">
          Paste a job description and let AI craft an ATS-optimized CV from your profile.
        </p>
      </div>

      {!isAIConfigured && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            AI provider not configured.{" "}
            <NextLink href="/dashboard/settings" className="underline font-medium">
              Go to Settings
            </NextLink>{" "}
            to add your API key.
          </span>
        </div>
      )}

      {isAIConfigured && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>
              Active AI: <span className="font-semibold text-foreground capitalize">{aiProvider === 'nvidia' ? 'Nvidia NIM' : aiProvider}</span> &bull; Model: <code className="font-mono text-foreground font-semibold">{model}</code>
            </span>
          </div>
          <NextLink href="/dashboard/settings" className="text-primary underline hover:text-primary/80">
            Change in Settings
          </NextLink>
        </div>
      )}

      {aiProvider === 'nvidia' && apiKey && !apiKey.startsWith('nvapi-') && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Key mismatch detected:</strong> You selected Nvidia NIM, but your saved API key starts with <code>{apiKey.substring(0, 7)}...</code> instead of <code>nvapi-</code>. Please <NextLink href="/dashboard/settings" className="underline font-semibold">go to Settings</NextLink> and save your NVIDIA API key.
          </span>
        </div>
      )}

      {/* Job input */}
      {!currentCV && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
            <CardDescription>Paste the job posting text or provide a URL to extract it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text">
              <TabsList className="mb-4">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="w-4 h-4" /> Paste Text
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <Link className="w-4 h-4" /> Paste URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-3">
                <Textarea
                  id="job-text"
                  placeholder="Paste the full job description here…"
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  rows={10}
                  className="resize-none font-mono text-xs"
                />
              </TabsContent>

              <TabsContent value="url" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="https://company.com/careers/role"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                  />
                  <Button onClick={handleExtractUrl} disabled={!jobUrl || isScraping} variant="secondary">
                    {isScraping ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    Extract
                  </Button>
                </div>
                {scrapeError && <p className="text-sm text-destructive">{scrapeError}</p>}
                {scrapedText && (
                  <Textarea
                    id="scraped-text"
                    value={scrapedText}
                    onChange={(e) => setScrapedText(e.target.value)}
                    rows={8}
                    className="resize-none font-mono text-xs"
                    placeholder="Extracted text — edit if needed"
                  />
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {projects.length > 0
                  ? `${projects.filter((p) => !p.hidden).length} projects available`
                  : "No projects synced yet"}
              </p>
              <Button
                id="generate-cv-btn"
                onClick={handleGenerate}
                disabled={!effectiveJobText || !isAIConfigured || isGenerating}
                className="gap-2"
                size="lg"
              >
                <Sparkles className="w-4 h-4" />
                Generate CV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation in progress */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Generating your CV…
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenerationProgress
              currentStep={generationStep}
              stepName={generationStepName}
              totalSteps={totalSteps}
              error={error}
            />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentCV && !isGenerating && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{currentCV.jobTitle}</h2>
              {currentCV.company && (
                <p className="text-muted-foreground text-sm">{currentCV.company}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <NextLink href={`/dashboard/editor/${currentCV.id}`}>
                <Button size="sm" className="gap-2" id="open-in-editor-btn">
                  <PencilLine className="w-4 h-4" />
                  Open in Editor
                </Button>
              </NextLink>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReOptimize}
                disabled={currentCV.optimizationCount >= 3 || isGenerating}
                className="gap-2"
                id="re-optimize-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Re-Optimize
                <Badge variant="secondary" className="ml-1 text-xs">
                  {3 - currentCV.optimizationCount} left
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  useCVStore.getState().clearCurrent();
                  setJobText("");
                  setScrapedText("");
                }}
              >
                New CV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* CV Preview — 2/3 width */}
            <div className="xl:col-span-2">
              <CVPreview
                sections={currentCV.sections}
                name={profile.personalInfo.fullName}
                email={profile.personalInfo.email}
                phone={profile.personalInfo.phone}
                city={profile.personalInfo.city}
                linkedinUrl={profile.personalInfo.linkedinUrl}
                websiteUrl={profile.personalInfo.websiteUrl}
              />
            </div>

            {/* ATS + Recommendations — 1/3 width */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">ATS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <ATSScoreGauge score={currentCV.atsScore} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCV.recommendations.slice(0, 5).map((rec: Recommendation) => (
                    <RecommendationCard key={rec.id} rec={rec} />
                  ))}
                </CardContent>
              </Card>

              {/* Settings link if not configured */}
              {!isAIConfigured && (
                <NextLink href="/dashboard/settings">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="w-4 h-4" />
                    Configure AI Provider
                  </Button>
                </NextLink>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const impactColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div className={cn("rounded-lg border px-3 py-2.5 text-xs space-y-1.5", impactColors[rec.impact] ?? impactColors.low)}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-snug">{rec.what}</p>
        <Badge
          variant="outline"
          className={cn("capitalize shrink-0 text-[10px] border-current", impactColors[rec.impact])}
        >
          {rec.impact}
        </Badge>
      </div>
      <p className="text-muted-foreground leading-snug">{rec.why}</p>
      <p className="font-medium leading-snug">{rec.howToFix}</p>
      {rec.resources?.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-0.5">
          {rec.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 opacity-70 hover:opacity-100"
            >
              {r.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
