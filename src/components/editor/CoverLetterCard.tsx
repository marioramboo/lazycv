"use client";

import { useEffect, useState } from "react";
import { GeneratedCV, CoverLetter } from "@/types/cv";
import { TemplateContact } from "@/components/templates";
import { useSettingsStore } from "@/stores/settings-store";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Download, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CoverLetterCardProps {
  cv: GeneratedCV;
  contact: TemplateContact;
}

export function CoverLetterCard({ cv, contact }: CoverLetterCardProps) {
  const settings = useSettingsStore();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Load existing cover letter from IndexedDB
  useEffect(() => {
    if (!cv.id) return;
    db.coverLetters.where('cvId').equals(cv.id).first().then((found) => {
      if (found) setCoverLetter(found);
    });
  }, [cv.id]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const profile = await db.profile.get('default');
      if (!profile) {
        throw new Error('Please complete your profile settings first.');
      }

      const projects = await db.projects.toArray();

      const aiConfig = {
        provider: settings.aiProvider,
        apiKey: settings.apiKey,
        model: settings.model,
        ollamaBaseUrl: settings.ollamaBaseUrl,
      };

      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, profile, projects, aiConfig }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      const generated: CoverLetter = data.coverLetter;

      // Save to Dexie
      await db.coverLetters.put(generated);
      setCoverLetter(generated);

      toast.success("Cover letter generated successfully!");
    } catch (err: unknown) {
      console.error("Cover letter generation failed:", err);
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleContentChange(newContent: string) {
    if (!coverLetter) return;
    const updated = { ...coverLetter, content: newContent };
    setCoverLetter(updated);
    if (coverLetter.id) {
      await db.coverLetters.put(updated);
    }
  }

  function handleCopy() {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter.content);
    setIsCopied(true);
    toast.success("Cover letter copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    if (!coverLetter) return;
    setIsExportingPdf(true);
    try {
      const { exportCoverLetterPDF } = await import("@/lib/export/pdf");
      const filename = `CoverLetter-${(contact.name || "Candidate").replace(/\s+/g, '_')}-${cv.jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      await exportCoverLetterPDF(coverLetter, contact, filename);
      toast.success("Cover letter PDF downloaded!");
    } catch (e: unknown) {
      console.error("Cover letter PDF export failed:", e);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Cover Letter
          </CardTitle>
          <CardDescription className="text-xs">
            Tailored 4-paragraph cover letter matched to the job description.
          </CardDescription>
        </div>
        {coverLetter && (
          <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!coverLetter ? (
          <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-center gap-3 bg-muted/30">
            <Sparkles className="h-8 w-8 text-blue-500/70" />
            <div>
              <p className="text-sm font-medium">No cover letter generated yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Generate a personalized cover letter matching your profile and projects to this role.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2 mt-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Cover Letter
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={coverLetter.content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={12}
              className="text-sm leading-relaxed font-sans focus-visible:ring-1"
              placeholder="Edit your cover letter here..."
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? "Copied!" : "Copy Text"}
              </Button>

              <Button size="sm" onClick={handleDownloadPdf} disabled={isExportingPdf} className="gap-1.5 text-xs">
                {isExportingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
