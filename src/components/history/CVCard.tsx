"use client";

import { useState } from "react";
import { GeneratedCV } from "@/types/cv";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Download, Copy, Trash2, Calendar, Building, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CVCardProps {
  cv: GeneratedCV;
  onOpenEditor: (id: string) => void;
  onDownloadPdf: (cv: GeneratedCV) => Promise<void>;
  onUseAsBase: (id: string) => void;
  onDelete: (id: string) => void;
}

export function atsScoreBadgeClass(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
  if (score >= 60) return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300";
  return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300";
}

export function CVCard({ cv, onOpenEditor, onDownloadPdf, onUseAsBase, onDelete }: CVCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formattedDate = new Date(cv.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadPdf(cv);
    } finally {
      setIsDownloading(false);
    }
  };

  const score = cv.atsScore?.overall ?? 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group border-border/80">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold line-clamp-1" title={cv.jobTitle}>
              {cv.jobTitle}
            </CardTitle>
            {cv.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building className="h-3 w-3 shrink-0" />
                <span className="truncate">{cv.company}</span>
              </p>
            )}
          </div>

          <Badge className={cn("text-xs font-semibold px-2 py-0.5 border shrink-0", atsScoreBadgeClass(score))}>
            ATS {score}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        {/* Metadata info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-b border-border/40 py-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary/70" />
            <span className="capitalize font-medium text-foreground/80">{cv.templateId || "Classic"} Template</span>
          </div>
        </div>

        {/* Requirements preview / skills snippet */}
        {cv.parsedJob?.requiredSkills && cv.parsedJob.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {cv.parsedJob.requiredSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium"
              >
                {skill}
              </span>
            ))}
            {cv.parsedJob.requiredSkills.length > 4 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{cv.parsedJob.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-3 px-4 bg-muted/20 border-t flex flex-col gap-2">
        {showConfirmDelete ? (
          <div className="flex items-center justify-between w-full py-1">
            <span className="text-xs font-medium text-destructive">Delete this CV?</span>
            <div className="flex gap-1">
              <Button variant="destructive" size="sm" className="h-7 text-xs px-2.5" onClick={() => onDelete(cv.id)}>
                Delete
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => setShowConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-1.5 w-full">
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs gap-1.5 flex-1 min-w-[100px]"
              onClick={() => onOpenEditor(cv.id)}
            >
              <Edit3 className="h-3.5 w-3.5" /> Open Editor
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download PDF"
            >
              {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">PDF</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => onUseAsBase(cv.id)}
              title="Use as Base (Duplicate)"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Use as Base</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setShowConfirmDelete(true)}
              title="Delete CV"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
