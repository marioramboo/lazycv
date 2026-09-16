"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobApplication, ApplicationStatus } from "@/types/job";
import { GeneratedCV } from "@/types/cv";
import { db } from "@/lib/db";
import { toast } from "sonner";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<JobApplication> | null;
  onSave: (data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function ApplicationDialog({ open, onOpenChange, initialData, onSave }: ApplicationDialogProps) {
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [dateApplied, setDateApplied] = useState(() => new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [notes, setNotes] = useState("");
  const [cvId, setCvId] = useState<string>("none");
  const [cvOptions, setCvOptions] = useState<GeneratedCV[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      db.generatedCVs.toArray().then(setCvOptions).catch(console.error);
      setCompany(initialData?.company ?? "");
      setTitle(initialData?.title ?? "");
      setDateApplied(initialData?.dateApplied ? initialData.dateApplied.split("T")[0] : new Date().toISOString().split("T")[0]);
      setStatus(initialData?.status ?? "applied");
      setNotes(initialData?.notes ?? "");
      setCvId(initialData?.cvId ?? "none");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!title.trim()) {
      toast.error("Job title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        company: company.trim(),
        title: title.trim(),
        dateApplied,
        status,
        notes: notes.trim(),
        cvId: cvId === "none" ? undefined : cvId,
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Job Application" : "Log New Application"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input
                id="dateApplied"
                type="date"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as ApplicationStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="ghosted">Ghosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cvUsed">CV Used (Optional)</Label>
            <Select value={cvId} onValueChange={(val) => setCvId(val || "none")}>
              <SelectTrigger id="cvUsed">
                <SelectValue placeholder="Select a generated CV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / External</SelectItem>
                {cvOptions.map((cv) => (
                  <SelectItem key={cv.id} value={cv.id}>
                    {cv.jobTitle} {cv.company ? `(${cv.company})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes & Reminders</Label>
            <Textarea
              id="notes"
              placeholder="Interview details, recruiter info, salary range..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData?.id ? "Update Application" : "Log Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
