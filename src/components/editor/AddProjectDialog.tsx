"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsStore } from "@/stores/projects-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/types/project";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProjectIdsInCV: string[];
  onConfirm: (project: { name: string; description: string; techStack: string[] }) => Promise<void>;
  onAddManualToLibrary: (project: Omit<Project, 'id' | 'source' | 'createdAt' | 'updatedAt' | 'pinned' | 'hidden'>) => Promise<void>;
}

export function AddProjectDialog({ open, onOpenChange, existingProjectIdsInCV, onConfirm, onAddManualToLibrary }: AddProjectDialogProps) {
  const { projects } = useProjectsStore();
  const [mode, setMode] = useState<"library" | "custom">("library");
  
  // Library mode
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  // Custom mode
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [saveToLibrary, setSaveToLibrary] = useState(true);

  const [isOptimizing, setIsOptimizing] = useState(false);

  const availableProjects = projects.filter(p => !existingProjectIdsInCV.includes(p.id));

  async function handleSubmit() {
    setIsOptimizing(true);
    try {
      if (mode === "library") {
        if (!selectedProjectId) {
          toast.error("Please select a project");
          return;
        }
        const p = projects.find(x => x.id === selectedProjectId);
        if (!p) return;
        await onConfirm({
          name: p.name,
          description: p.description || p.originalDescription || "",
          techStack: p.techStack || [],
        });
      } else {
        if (!name.trim()) {
          toast.error("Project name is required");
          return;
        }
        const techStackArr = techStack.split(",").map(s => s.trim()).filter(Boolean);
        const p = {
          name,
          description,
          techStack: techStackArr,
        };
        
        if (saveToLibrary) {
          await onAddManualToLibrary(p);
        }
        await onConfirm(p);
      }
      onOpenChange(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to process project");
    } finally {
      setIsOptimizing(false);
    }
  }

  function resetForm() {
    setMode("library");
    setSelectedProjectId("");
    setName("");
    setDescription("");
    setTechStack("");
    setSaveToLibrary(true);
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && !isOptimizing) onOpenChange(false);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Choose a project from your library or create a new one. The AI will optimize it for this CV.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button 
            variant={mode === "library" ? "default" : "outline"} 
            size="sm" 
            className="flex-1"
            onClick={() => setMode("library")}
          >
            From Library
          </Button>
          <Button 
            variant={mode === "custom" ? "default" : "outline"} 
            size="sm" 
            className="flex-1"
            onClick={() => setMode("custom")}
          >
            Custom Project
          </Button>
        </div>

        {mode === "library" ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Project</Label>
              <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.length === 0 ? (
                    <SelectItem value="none" disabled>No available projects</SelectItem>
                  ) : (
                    availableProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="E.g. LazyCV Generator" />
            </div>
            <div className="space-y-2">
              <Label>Tech Stack</Label>
              <Input value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Node.js, Next.js..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Briefly describe what this project does..."
                className="resize-none h-20"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="saveToLibrary" 
                checked={saveToLibrary} 
                onCheckedChange={(c: boolean | 'indeterminate') => setSaveToLibrary(c === true)} 
              />
              <Label htmlFor="saveToLibrary" className="text-sm font-normal">Save to my projects library</Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isOptimizing}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isOptimizing || (mode === 'library' && !selectedProjectId)}>
            {isOptimizing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...</> : 'Add Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
