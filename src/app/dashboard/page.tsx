"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, FolderGit2, Sparkles, Settings, ArrowRight, CheckCircle2, Circle, Kanban, History, FileText, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { useProfileStore } from "@/stores/profile-store";
import { useProjectsStore } from "@/stores/projects-store";
import { useCVStore } from "@/stores/cv-store";
import { useTrackerStore } from "@/stores/tracker-store";
import { useSettingsStore } from "@/stores/settings-store";
import { statusBadgeClass } from "@/components/tracker/TrackerRow";
import { atsScoreBadgeClass } from "@/components/history/CVCard";

export default function DashboardPage() {
  const { loadProfile, personalInfo, education, experience, skills, certifications } = useProfileStore();
  const { projects, lastSynced, loadProjects } = useProjectsStore();
  const { cvHistory, loadAllCVs } = useCVStore();
  const { applications, loadApplications } = useTrackerStore();
  const settings = useSettingsStore();

  useEffect(() => {
    loadProfile();
    loadProjects();
    loadAllCVs();
    loadApplications();
  }, [loadProfile, loadProjects, loadAllCVs, loadApplications]);

  let profileScore = 0;
  if (personalInfo.fullName) profileScore += 20;
  if (education.length > 0) profileScore += 20;
  if (experience.length > 0) profileScore += 20;
  if (skills.length > 0) profileScore += 20;
  if (certifications.length > 0) profileScore += 20;

  const isProfileComplete = profileScore === 100;
  const areProjectsLoaded = projects.length > 0;
  const isAiConfigured = Boolean(settings.apiKey || settings.aiProvider === "ollama");

  const actions = [
    {
      title: "Set Up Profile",
      description: "Enter your personal info, experience, and skills.",
      href: "/dashboard/profile",
      icon: User,
      status: isProfileComplete,
      statusText: isProfileComplete ? "Complete" : `${profileScore}% Complete`,
    },
    {
      title: "Connect GitHub",
      description: "Import your best projects directly from GitHub.",
      href: "/dashboard/projects",
      icon: FolderGit2,
      status: areProjectsLoaded,
      statusText: areProjectsLoaded 
        ? `${projects.length} Projects ${lastSynced ? `(Synced)` : ''}`
        : "Pending",
    },
    {
      title: "Configure AI",
      description: "Set up your AI provider (OpenAI, Claude, etc).",
      href: "/dashboard/settings",
      icon: Settings,
      status: isAiConfigured,
      statusText: isAiConfigured ? "Configured" : "Pending",
    },
    {
      title: "Generate CV",
      description: "Create a tailored CV for a specific job offer.",
      href: "/dashboard/generate",
      icon: Sparkles,
      status: cvHistory.length > 0,
      statusText: cvHistory.length > 0 ? `${cvHistory.length} CVs Created` : "Pending",
    },
  ];

  const recentCVs = cvHistory.slice(0, 3);
  const recentApps = applications.slice(0, 3);

  // Status breakdown calculations
  const totalApps = applications.length;
  const statusCounts = {
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    ghosted: applications.filter((a) => a.status === "ghosted").length,
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to LazyCV</CardTitle>
          <CardDescription className="text-base">
            Your open-source, local-first AI CV generator. Manage your profile, build tailored resumes, and track job applications locally.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/generate">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate New CV
            </Button>
          </Link>
          <Link href="/dashboard/tracker">
            <Button variant="outline" className="gap-2">
              <Kanban className="h-4 w-4" /> View Job Tracker
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Setup Checklist Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {action.title}
                </CardTitle>
                <action.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  {action.description}
                </p>
                <div className="flex items-center text-xs font-medium">
                  {action.status ? (
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> {action.statusText}
                    </span>
                  ) : (
                    <span className="flex items-center opacity-80 text-muted-foreground">
                      <Circle className="mr-1 h-3 w-3" /> {action.statusText}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Generated Resumes</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              {cvHistory.length}
              <History className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/history" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              View History <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Tracked Applications</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              {totalApps}
              <Kanban className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tracker" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              Go to Tracker <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Application Pipeline Breakdown</CardDescription>
            <div className="text-xs font-medium mt-1 flex items-center justify-between text-muted-foreground">
              <span>Applied: {statusCounts.applied}</span>
              <span>Interview: {statusCounts.interview}</span>
              <span>Offer: {statusCounts.offer}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {/* Simple CSS Segmented Progress Bar */}
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex">
              {totalApps > 0 ? (
                <>
                  <div style={{ width: `${(statusCounts.applied / totalApps) * 100}%` }} className="bg-blue-500" title={`Applied (${statusCounts.applied})`} />
                  <div style={{ width: `${(statusCounts.interview / totalApps) * 100}%` }} className="bg-amber-500" title={`Interview (${statusCounts.interview})`} />
                  <div style={{ width: `${(statusCounts.offer / totalApps) * 100}%` }} className="bg-emerald-500" title={`Offer (${statusCounts.offer})`} />
                  <div style={{ width: `${(statusCounts.rejected / totalApps) * 100}%` }} className="bg-rose-500" title={`Rejected (${statusCounts.rejected})`} />
                  <div style={{ width: `${(statusCounts.ghosted / totalApps) * 100}%` }} className="bg-slate-400" title={`Ghosted (${statusCounts.ghosted})`} />
                </>
              ) : (
                <div className="w-full h-full bg-muted-foreground/20" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout for Recent CVs & Recent Applications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent CVs */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Recent Generated CVs
              </CardTitle>
              <CardDescription className="text-xs">Your latest AI resume builds</CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                All History <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2.5">
            {recentCVs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                No CVs generated yet.
              </p>
            ) : (
              recentCVs.map((cv) => (
                <Link
                  key={cv.id}
                  href={`/dashboard/editor/${cv.id}`}
                  className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold truncate">{cv.jobTitle}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{cv.company || "General"}</p>
                  </div>
                  <Badge className={cn("text-[10px] px-1.5 py-0 border font-medium shrink-0", atsScoreBadgeClass(cv.atsScore?.overall ?? 0))}>
                    ATS {cv.atsScore?.overall ?? 0}%
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Kanban className="h-4 w-4 text-primary" /> Recent Applications
              </CardTitle>
              <CardDescription className="text-xs">Jobs you logged recently</CardDescription>
            </div>
            <Link href="/dashboard/tracker">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                Full Tracker <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2.5">
            {recentApps.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                No job applications tracked yet.
              </p>
            ) : (
              recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold truncate">{app.company}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{app.title}</p>
                  </div>
                  <Badge className={cn("text-[10px] px-2 py-0.5 border font-semibold capitalize shrink-0", statusBadgeClass(app.status))}>
                    {app.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
