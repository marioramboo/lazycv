"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCVStore } from "@/stores/cv-store";
import { useProfileStore } from "@/stores/profile-store";
import { GeneratedCV } from "@/types/cv";
import { CVCard } from "@/components/history/CVCard";
import { exportPDF } from "@/lib/export/pdf";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Plus, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";

type SortOption = "date-desc" | "date-asc" | "score-desc" | "score-asc";

export default function HistoryPage() {
  const router = useRouter();
  const { cvHistory, loadAllCVs, deleteCV, duplicateCV } = useCVStore();
  const profile = useProfileStore();

  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  useEffect(() => {
    loadAllCVs();
    profile.loadProfile();
  }, [loadAllCVs, profile]);

  const contact = {
    name: profile.personalInfo.fullName || "Your Name",
    email: profile.personalInfo.email,
    phone: profile.personalInfo.phone,
    city: profile.personalInfo.city,
    linkedinUrl: profile.personalInfo.linkedinUrl,
    websiteUrl: profile.personalInfo.websiteUrl,
  };

  const handleDownloadPdf = async (cv: GeneratedCV) => {
    try {
      await exportPDF(cv, contact, `${contact.name || "CV"}-${cv.jobTitle}.pdf`);
      toast.success("PDF downloaded!");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to download PDF";
      toast.error(msg);
    }
  };

  const handleOpenEditor = (id: string) => {
    router.push(`/dashboard/editor/${id}`);
  };

  const handleUseAsBase = async (id: string) => {
    const newId = await duplicateCV(id);
    if (newId) {
      router.push(`/dashboard/editor/${newId}`);
    }
  };

  const filteredAndSortedCVs = useMemo(() => {
    return cvHistory
      .filter((cv) => {
        // Template filter
        if (templateFilter !== "all" && cv.templateId !== templateFilter) {
          return false;
        }
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchTitle = cv.jobTitle?.toLowerCase().includes(q);
          const matchCompany = cv.company?.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "date-desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === "date-asc") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOption === "score-desc") {
          return (b.atsScore?.overall ?? 0) - (a.atsScore?.overall ?? 0);
        }
        if (sortOption === "score-asc") {
          return (a.atsScore?.overall ?? 0) - (b.atsScore?.overall ?? 0);
        }
        return 0;
      });
  }, [cvHistory, search, templateFilter, sortOption]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">CV History</h1>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
              {cvHistory.length} Total
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            View, edit, re-download, or duplicate past AI-generated CVs.
          </p>
        </div>

        <Link href="/dashboard/generate">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create New CV
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Template filter */}
          <div className="flex items-center gap-1.5 min-w-[150px]">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={templateFilter} onValueChange={(val) => setTemplateFilter(val || "all")}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort selector */}
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="h-9 text-xs min-w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="score-desc">Highest ATS Score</SelectItem>
              <SelectItem value="score-asc">Lowest ATS Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CV Grid or Empty state */}
      {filteredAndSortedCVs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-lg border bg-card">
          <div className="p-3 bg-muted rounded-full mb-3">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">
            {cvHistory.length === 0 ? "No CVs generated yet" : "No matching CVs"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
            {cvHistory.length === 0
              ? "Generate your first AI-tailored resume to get started!"
              : "Try adjusting your search query or template filter."}
          </p>
          {cvHistory.length === 0 && (
            <Link href="/dashboard/generate">
              <Button size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate Your First CV
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedCVs.map((cv) => (
            <CVCard
              key={cv.id}
              cv={cv}
              onOpenEditor={handleOpenEditor}
              onDownloadPdf={handleDownloadPdf}
              onUseAsBase={handleUseAsBase}
              onDelete={deleteCV}
            />
          ))}
        </div>
      )}
    </div>
  );
}
