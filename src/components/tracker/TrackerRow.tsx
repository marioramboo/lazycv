"use client";

import { useState } from "react";
import Link from "next/link";
import { JobApplication, ApplicationStatus } from "@/types/job";
import { GeneratedCV } from "@/types/cv";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackerRowProps {
  application: JobApplication;
  linkedCV?: GeneratedCV;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

export function statusBadgeClass(status: ApplicationStatus) {
  switch (status) {
    case "applied":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    case "interview":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "offer":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    case "rejected":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    case "ghosted":
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

export function TrackerRow({
  application,
  linkedCV,
  onUpdateStatus,
  onUpdateNotes,
  onEdit,
  onDelete,
}: TrackerRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(application.notes || "");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(application.id, notesText);
    setIsEditingNotes(false);
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/30">
      {/* Company */}
      <td className="p-3 font-medium text-sm text-foreground align-top">
        {application.company}
      </td>

      {/* Job Title */}
      <td className="p-3 text-sm text-foreground font-medium align-top">
        {application.title}
      </td>

      {/* Date Applied */}
      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap align-top">
        {application.dateApplied || application.createdAt.split("T")[0]}
      </td>

      {/* CV Used */}
      <td className="p-3 text-xs align-top whitespace-nowrap">
        {application.cvId ? (
          <Link
            href={`/dashboard/editor/${application.cvId}`}
            className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">{linkedCV ? linkedCV.jobTitle : "View CV"}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground italic">None</span>
        )}
      </td>

      {/* Status (inline select) */}
      <td className="p-3 align-top whitespace-nowrap">
        <Select
          value={application.status}
          onValueChange={(val) => onUpdateStatus(application.id, val as ApplicationStatus)}
        >
          <SelectTrigger
            className={cn(
              "h-7 text-xs font-semibold px-2 rounded-full border border-dashed transition-all w-[110px]",
              statusBadgeClass(application.status)
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="ghosted">Ghosted</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Notes (inline editable) */}
      <td className="p-3 text-xs text-muted-foreground align-top max-w-[220px]">
        {isEditingNotes ? (
          <div className="space-y-1.5">
            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="text-xs min-h-[60px] p-2"
              placeholder="Add notes..."
            />
            <div className="flex gap-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setIsEditingNotes(false)}
              >
                Cancel
              </Button>
              <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleSaveNotes}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="cursor-pointer hover:bg-muted/50 rounded p-1.5 transition-colors group min-h-[28px] flex items-center justify-between"
            title="Click to edit notes"
          >
            <span className="line-clamp-2">
              {application.notes || <span className="italic opacity-60">Add note…</span>}
            </span>
            <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0 ml-1" />
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="p-3 text-right align-top whitespace-nowrap">
        {showConfirmDelete ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-[10px] text-destructive font-medium mr-1">Delete?</span>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-[10px] px-2"
              onClick={() => onDelete(application.id)}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2"
              onClick={() => setShowConfirmDelete(false)}
            >
              No
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(application)}
              title="Edit application"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setShowConfirmDelete(true)}
              title="Delete application"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
