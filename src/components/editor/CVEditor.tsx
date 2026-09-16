"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeneratedCV, CVSection } from "@/types/cv";
import { useCVStore } from "@/stores/cv-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useProjectsStore } from "@/stores/projects-store";
import { TEMPLATES, TemplateContact, recommendTemplate } from "@/components/templates/index";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { AddProjectDialog } from "./AddProjectDialog";
import { CoverLetterCard } from "./CoverLetterCard";
import { ATSScoreGauge } from "@/components/cv/ATSScoreGauge";
import { RichTextEditor } from "./RichTextEditor";
import { DraggableBullets } from "./DraggableBullets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrackerStore } from "@/stores/tracker-store";
import { ApplicationDialog } from "@/components/tracker/ApplicationDialog";
import { RotateCcw, Download, FileText, Loader2, Plus, Trash2, Briefcase, ChevronUp, ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { exportPDF } from "@/lib/export/pdf";
import { exportDOCX } from "@/lib/export/docx";

interface CVEditorProps {
  cv: GeneratedCV;
  contact: TemplateContact;
  /** Original snapshot from first load — used for "Reset to AI Version" */
  originalCV: GeneratedCV;
}

export function CVEditor({ cv, contact, originalCV }: CVEditorProps) {
  const { updateSection, updateSectionTitle, addSection, removeSection, moveSection, updateScore, reOptimize, isGenerating } = useCVStore();
  const settings = useSettingsStore();
  const { addManualProject } = useProjectsStore();

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isLogAppOpen, setIsLogAppOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState("custom");

  const [templateId, setTemplateId] = useState(
    cv.templateId && TEMPLATES.find((t) => t.id === cv.templateId) ? cv.templateId : "classic",
  );
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const recommendedId = recommendTemplate(cv.parsedJob.industry, cv.parsedJob.seniorityLevel);

  // Debounced autosave
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const currentCV = useCVStore.getState().currentCV;
      if (currentCV) {
        await db.generatedCVs.put({ ...currentCV, updatedAt: new Date().toISOString() });
      }
    }, 1500);
  }, []);

  // Sync templateId to DB
  useEffect(() => {
    scheduleSave();
    // ponytail: templateId change triggers autosave
  }, [templateId, scheduleSave]);

  // Debounced ATS re-scoring
  const scoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const scheduleScoring = useCallback(() => {
    if (scoreTimer.current) clearTimeout(scoreTimer.current);
    scoreTimer.current = setTimeout(async () => {
      const currentCV = useCVStore.getState().currentCV;
      if (!currentCV) return;
      
      setIsScoring(true);
      try {
        const aiConfig = {
          provider: settings.aiProvider,
          apiKey: settings.apiKey,
          model: settings.model,
          ollamaBaseUrl: settings.ollamaBaseUrl,
        };
        const res = await fetch('/api/score-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv: currentCV, aiConfig }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.score) {
            updateScore(data.score);
          }
        }
      } catch (e) {
        console.error('Failed to update ATS score', e);
      } finally {
        setIsScoring(false);
      }
    }, 2000);
  }, [settings.aiProvider, settings.apiKey, settings.model, settings.ollamaBaseUrl, updateScore]);

  function handleSectionChange(sectionId: string, content: unknown) {
    updateSection(sectionId, content);
    scheduleSave();
    scheduleScoring();
  }

  function handleSectionTitleChange(sectionId: string, title: string) {
    updateSectionTitle(sectionId, title);
    scheduleSave();
  }

  function handleMoveSection(sectionId: string, direction: "up" | "down") {
    moveSection(sectionId, direction);
    scheduleSave();
  }

  function handleRemoveSection(sectionId: string) {
    removeSection(sectionId);
    scheduleSave();
    scheduleScoring();
    toast.success("Section removed");
  }

  function handleAddSection(type: string) {
    const defaultTitles: Record<string, string> = {
      summary: "Professional Summary",
      skills: "Technical Skills",
      experience: "Work Experience",
      projects: "Projects",
      education: "Education",
      certifications: "Certifications",
      custom: "Additional Information",
    };
    const defaultContents: Record<string, any> = {
      summary: { text: "" },
      skills: { categories: [{ name: "Skills", skills: [] }] },
      experience: { items: [] },
      projects: { items: [] },
      education: { items: [] },
      certifications: { items: [] },
      custom: { text: "", items: [] },
    };

    const title = defaultTitles[type] || "New Section";
    addSection({
      id: crypto.randomUUID(),
      type,
      title,
      content: defaultContents[type] || { text: "" },
    });
    scheduleSave();
    scheduleScoring();
    toast.success(`Added ${title} section`);
  }

  function handleReset() {
    // Restore all sections from originalCV snapshot
    for (const section of originalCV.sections) {
      updateSection(section.id, section.content);
    }
    toast.success("Reset to AI-generated version");
  }

  async function handleConfirmAddProject(project: { name: string; description: string; techStack: string[] }) {
    const aiConfig = {
      provider: settings.aiProvider,
      apiKey: settings.apiKey,
      model: settings.model,
      ollamaBaseUrl: settings.ollamaBaseUrl,
    };
    
    const res = await fetch('/api/optimize-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsedJob: cv.parsedJob, project, aiConfig }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to optimize project");
    }
    
    const { project: optimizedProject } = await res.json();
    
    const projectsSection = cv.sections.find(s => s.type === 'projects');
    if (projectsSection) {
      const c = projectsSection.content;
      const nextItems = [...(c?.items ?? []), optimizedProject];
      updateSection(projectsSection.id, { ...c, items: nextItems });
      scheduleSave();
      scheduleScoring();
    }
  }

  async function handleDownloadPdf() {
    setIsExportingPdf(true);
    try {
      await exportPDF(cv, contact, `${contact.name || "CV"}-${cv.jobTitle}.pdf`);
    } catch (e: any) {
      toast.error(e?.message || "PDF export failed");
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleDownloadDocx() {
    setIsExportingDocx(true);
    try {
      await exportDOCX(cv, contact, `${contact.name || "CV"}-${cv.jobTitle}.docx`);
    } catch (e: any) {
      toast.error(e?.message || "DOCX export failed");
      console.error(e);
    } finally {
      setIsExportingDocx(false);
    }
  }

  async function handleAIReOptimize() {
    const aiConfig = {
      provider: settings.aiProvider,
      apiKey: settings.apiKey,
      model: settings.model,
      ollamaBaseUrl: settings.ollamaBaseUrl,
    };
    await reOptimize(aiConfig);
  }

  const activeTpl = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const TemplateComponent = activeTpl.component;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* Left: editable sections */}
      <div className="xl:col-span-2 space-y-4">
        {/* Header info (read-only) */}
        <div className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{cv.jobTitle}</p>
            {cv.company && <p className="text-sm text-muted-foreground">{cv.company}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={handleAIReOptimize}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Re-Optimize with AI
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setIsLogAppOpen(true)}>
              <Briefcase className="h-3.5 w-3.5" /> Log Application
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground text-xs" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset to AI version
            </Button>
          </div>
        </div>

        {/* Editable CV sections */}
        {cv.sections.map((section, index) => (
          <SectionBlock
            key={section.id}
            section={section}
            index={index}
            totalSections={cv.sections.length}
            onChange={(content) => handleSectionChange(section.id, content)}
            onUpdateTitle={(title) => handleSectionTitleChange(section.id, title)}
            onMoveUp={() => handleMoveSection(section.id, "up")}
            onMoveDown={() => handleMoveSection(section.id, "down")}
            onRemove={() => handleRemoveSection(section.id)}
            onAddProjectClick={() => setIsProjectDialogOpen(true)}
          />
        ))}

        {/* Add Section Controls */}
        <div className="rounded-lg border border-dashed p-4 flex flex-wrap items-center justify-between gap-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Add new section to CV</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 text-xs rounded-md border border-input bg-background px-2.5 py-1 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value)}
            >
              <option value="summary">Professional Summary</option>
              <option value="skills">Technical Skills</option>
              <option value="experience">Work Experience</option>
              <option value="projects">Projects</option>
              <option value="education">Education</option>
              <option value="certifications">Certifications</option>
              <option value="custom">Custom Section</option>
            </select>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleAddSection(newSectionType)}>
              <Plus className="h-3.5 w-3.5" /> Add Section
            </Button>
          </div>
        </div>

        {/* Template preview (rendered) */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <TemplateComponent cv={cv} {...contact} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="space-y-4">
        {/* ATS Score */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">ATS Score</CardTitle>
            {(isGenerating || isScoring) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardHeader>
          <CardContent className="space-y-3">
            <ATSScoreGauge score={cv.atsScore} />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={handleAIReOptimize}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              Re-Optimize CV & Recommendations
            </Button>
          </CardContent>
        </Card>

        {/* Cover Letter */}
        <CoverLetterCard cv={cv} contact={contact} />

        {/* Template selector */}
        <Card>
          <CardContent className="pt-4">
            <TemplateSelector
              cv={cv}
              contact={contact}
              selectedId={templateId}
              recommendedId={recommendedId}
              onSelect={setTemplateId}
            />
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              id="download-pdf-btn"
              className="w-full gap-2"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
            >
              {isExportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
            <Button
              id="download-docx-btn"
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
            >
              {isExportingDocx ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Download DOCX
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">Auto-saves every 1.5s</p>
      </div>

      <AddProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        existingProjectIdsInCV={cv.selectedProjectIds || []}
        onConfirm={handleConfirmAddProject as any}
        onAddManualToLibrary={addManualProject}
      />

      <ApplicationDialog
        open={isLogAppOpen}
        onOpenChange={setIsLogAppOpen}
        initialData={{
          company: cv.company || "",
          title: cv.jobTitle || "",
          cvId: cv.id,
          status: "applied",
          dateApplied: new Date().toISOString().split("T")[0],
        }}
        onSave={async (data) => {
          await useTrackerStore.getState().addApplication(data);
        }}
      />
    </div>
  );
}

/** Renders a single editable section */
function SectionBlock({
  section,
  index,
  totalSections,
  onChange,
  onUpdateTitle,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddProjectClick,
}: {
  section: CVSection;
  index: number;
  totalSections: number;
  onChange: (content: unknown) => void;
  onUpdateTitle: (title: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddProjectClick?: () => void;
}) {
  const c = section.content;

  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-3")}>
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2 flex-1">
          <Input
            className="h-7 text-sm font-semibold max-w-[240px] bg-transparent border-transparent hover:border-input focus:border-input px-1.5"
            value={section.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
          />
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
            {section.type}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            disabled={index === 0}
            onClick={onMoveUp}
            title="Move section up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            disabled={index === totalSections - 1}
            onClick={onMoveDown}
            title="Move section down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            title="Remove section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {section.type === "summary" && (
        <RichTextEditor
          content={c?.text ?? ""}
          onChange={(html) => onChange({ text: stripTags(html) })}
          placeholder="Write a professional summary…"
        />
      )}

      {section.type === "skills" && (
        <div className="space-y-3">
          {(c?.categories ?? []).map((cat: { name: string; skills: string[] }, i: number) => (
            <div key={i} className="space-y-2 rounded border border-border/50 p-3 relative group">
              <div className="flex items-center gap-2">
                <Input
                  className="h-7 text-xs font-medium max-w-[200px]"
                  value={cat.name}
                  onChange={(e) => {
                    const next = [...(c?.categories ?? [])];
                    next[i] = { ...cat, name: e.target.value };
                    onChange({ ...c, categories: next });
                  }}
                  placeholder="Category Name"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                  onClick={() => {
                    const next = [...(c?.categories ?? [])];
                    next.splice(i, 1);
                    onChange({ ...c, categories: next });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <RichTextEditor
                content={cat.skills.join(", ")}
                onChange={(html) => {
                  const next = [...(c?.categories ?? [])];
                  next[i] = { ...cat, skills: stripTags(html).split(",").map((s: string) => s.trim()).filter(Boolean) };
                  onChange({ ...c, categories: next });
                }}
                placeholder="Skill 1, Skill 2…"
              />
            </div>
          ))}
          {c?.categories && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs h-8"
              onClick={() => {
                const next = [...(c?.categories ?? []), { name: "New Category", skills: [] }];
                onChange({ ...c, categories: next });
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          )}
          {!c?.categories && Array.isArray(c?.skills) && (
            <RichTextEditor
              content={(c.skills as string[]).join(", ")}
              onChange={(html) => onChange({ skills: stripTags(html).split(",").map((s: string) => s.trim()).filter(Boolean) })}
              placeholder="Skill 1, Skill 2…"
            />
          )}
        </div>
      )}

      {section.type === "experience" && (
        <div className="space-y-4">
          {(c?.items ?? []).map(
            (item: { title: string; company: string; startDate: string; endDate: string; bullets: string[] }, i: number) => (
              <div key={i} className="space-y-3 rounded border border-border/50 p-3 relative group">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-7 text-xs font-semibold flex-1"
                    value={item.title || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, title: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Job Title"
                  />
                  <Input
                    className="h-7 text-xs font-medium flex-1"
                    value={item.company || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, company: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Company Name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const next = [...(c?.items ?? [])];
                      next.splice(i, 1);
                      onChange({ ...c, items: next });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="h-7 text-xs"
                    value={item.startDate || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, startDate: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Start Date (e.g. Jan 2022)"
                  />
                  <Input
                    className="h-7 text-xs"
                    value={item.endDate || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, endDate: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="End Date (e.g. Present)"
                  />
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                    Bullet Points
                  </p>
                  <DraggableBullets
                    bullets={item.bullets ?? []}
                    onChange={(bullets) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, bullets };
                      onChange({ ...c, items: next });
                    }}
                  />
                </div>
              </div>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs h-8"
            onClick={() => {
              const next = [...(c?.items ?? []), { title: "Job Title", company: "Company Name", startDate: "YYYY", endDate: "Present", bullets: [] }];
              onChange({ ...c, items: next });
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Experience
          </Button>
        </div>
      )}

      {section.type === "projects" && (
        <div className="space-y-4">
          {(c?.items ?? []).map(
            (item: { name: string; description: string; techStack: string[]; impact?: string; bullets?: string[] }, i: number) => (
              <div key={i} className="space-y-3 rounded border border-border/50 p-3 relative group">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-7 text-xs font-semibold flex-1"
                    value={item.name}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, name: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Project Name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const next = [...(c?.items ?? [])];
                      next.splice(i, 1);
                      onChange({ ...c, items: next });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="h-7 text-xs"
                    value={(item.techStack || []).join(", ")}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, techStack: e.target.value.split(",").map(s => s.trim()).filter(Boolean) };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Tech Stack (comma separated)"
                  />
                  <Input
                    className="h-7 text-xs"
                    value={item.impact || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, impact: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Impact (e.g. Increased speed by 20%)"
                  />
                </div>

                <RichTextEditor
                  content={item.description}
                  onChange={(html) => {
                    const next = [...(c?.items ?? [])];
                    next[i] = { ...item, description: stripTags(html) };
                    onChange({ ...c, items: next });
                  }}
                  placeholder="Describe the project…"
                />
                
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Bullet Points</p>
                  <DraggableBullets
                    bullets={item.bullets || []}
                    onChange={(bullets) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, bullets };
                      onChange({ ...c, items: next });
                    }}
                  />
                </div>
              </div>
            )
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs h-8"
            onClick={() => {
              if (onAddProjectClick) onAddProjectClick();
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Project
          </Button>
        </div>
      )}

      {section.type === "certifications" && (
        <div className="space-y-3">
          {(c?.items ?? []).map(
            (item: { name: string; organization: string; date: string; url?: string }, i: number) => (
              <div key={i} className="space-y-2 rounded border border-border/50 p-3 relative group">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-7 text-xs font-semibold flex-1"
                    value={item.name}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, name: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Certification Name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const next = [...(c?.items ?? [])];
                      next.splice(i, 1);
                      onChange({ ...c, items: next });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="h-7 text-xs"
                    value={item.organization || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, organization: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Issuing Organization"
                  />
                  <Input
                    className="h-7 text-xs"
                    value={item.date || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, date: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Date (e.g. 2024)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    className="h-7 text-xs flex-1"
                    value={item.url || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, url: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Credential URL (e.g. https://coursera.org/verify/...)"
                  />
                  {item.url && (
                    <a
                      href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" /> Preview
                    </a>
                  )}
                </div>
              </div>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs h-8"
            onClick={() => {
              const next = [...(c?.items ?? []), { name: "New Certification", organization: "Issuer", date: "2024", url: "" }];
              onChange({ ...c, items: next });
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Certification
          </Button>
        </div>
      )}

      {section.type === "education" && (
        <div className="space-y-3">
          {(c?.items ?? []).map(
            (item: { degree: string; field: string; institution: string; startDate: string; endDate: string; gpa?: string }, i: number) => (
              <div key={i} className="space-y-2 rounded border border-border/50 p-3 relative group">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-7 text-xs font-semibold flex-1"
                    value={item.degree}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, degree: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Degree (e.g. B.S.)"
                  />
                  <Input
                    className="h-7 text-xs flex-1"
                    value={item.field}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, field: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Field (e.g. Computer Science)"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const next = [...(c?.items ?? [])];
                      next.splice(i, 1);
                      onChange({ ...c, items: next });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    className="h-7 text-xs"
                    value={item.institution || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, institution: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Institution"
                  />
                  <Input
                    className="h-7 text-xs"
                    value={item.startDate || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, startDate: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="Start Date"
                  />
                  <Input
                    className="h-7 text-xs"
                    value={item.endDate || ""}
                    onChange={(e) => {
                      const next = [...(c?.items ?? [])];
                      next[i] = { ...item, endDate: e.target.value };
                      onChange({ ...c, items: next });
                    }}
                    placeholder="End Date"
                  />
                </div>
              </div>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs h-8"
            onClick={() => {
              const next = [...(c?.items ?? []), { degree: "B.S.", field: "Field", institution: "University", startDate: "2020", endDate: "2024" }];
              onChange({ ...c, items: next });
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Education
          </Button>
        </div>
      )}

      {section.type !== "summary" &&
        section.type !== "skills" &&
        section.type !== "experience" &&
        section.type !== "projects" &&
        section.type !== "education" &&
        section.type !== "certifications" && (
          <div className="space-y-3">
            <RichTextEditor
              content={c?.text ?? ""}
              onChange={(html) => onChange({ ...c, text: stripTags(html) })}
              placeholder="Section text or details…"
            />
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                Bullet Points (Optional)
              </p>
              <DraggableBullets
                bullets={Array.isArray(c?.items) ? c.items : []}
                onChange={(items) => onChange({ ...c, items })}
              />
            </div>
          </div>
        )}
    </div>
  );
}

/** Strip HTML tags to plain text */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}
