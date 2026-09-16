"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Project } from "@/types/project";

interface ManualProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (projectData: any) => void;
  initialData?: Project | null;
}

export function ManualProjectForm({ open, onOpenChange, onSubmit, initialData }: ManualProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [role, setRole] = useState("");
  const [impact, setImpact] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setDescription(initialData.description || "");
        setTechStack(initialData.techStack ? initialData.techStack.join(", ") : "");
        setRole(initialData.role || "");
        setImpact(initialData.impact || "");
      } else {
        setName("");
        setDescription("");
        setTechStack("");
        setRole("");
        setImpact("");
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: (name || "").trim(),
      description: (description || "").trim(),
      techStack: (techStack || "").split(',').map(s => s.trim()).filter(Boolean),
      role: (role || "").trim(),
      impact: (impact || "").trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Edit Project' : 'Add Manual Project'}</DialogTitle>
            <DialogDescription>
              {initialData?.source === 'github' 
                ? 'Edit details for this synced repository. This will override the default description.'
                : 'Add a project manually that is not on your GitHub.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
              <Input id="techStack" value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, TypeScript, Tailwind" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="Lead Developer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impact">Impact / Metric</Label>
                <Input id="impact" value={impact} onChange={e => setImpact(e.target.value)} placeholder="e.g. +20% conversion" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!name.trim()}>Save Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
