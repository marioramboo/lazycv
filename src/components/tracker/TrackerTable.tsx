"use client";

import { useMemo, useState } from "react";
import { JobApplication, ApplicationStatus } from "@/types/job";
import { GeneratedCV } from "@/types/cv";
import { TrackerRow } from "./TrackerRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Kanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackerTableProps {
  applications: JobApplication[];
  cvs: GeneratedCV[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

type SortField = "company" | "title" | "dateApplied" | "status";

const STATUS_FILTERS: { label: string; value: "all" | ApplicationStatus }[] = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Ghosted", value: "ghosted" },
];

export function TrackerTable({
  applications,
  cvs,
  onUpdateStatus,
  onUpdateNotes,
  onEdit,
  onDelete,
  onAddNew,
}: TrackerTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [sortField, setSortField] = useState<SortField>("dateApplied");
  const [sortAsc, setSortAsc] = useState(false);

  // Map cvId -> GeneratedCV for quick lookup
  const cvMap = useMemo(() => {
    const map = new Map<string, GeneratedCV>();
    for (const cv of cvs) {
      map.set(cv.id, cv);
    }
    return map;
  }, [cvs]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredAndSorted = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (statusFilter !== "all" && app.status !== statusFilter) {
          return false;
        }
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchCompany = app.company.toLowerCase().includes(q);
          const matchTitle = app.title.toLowerCase().includes(q);
          const matchNotes = app.notes?.toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "company") {
          cmp = a.company.localeCompare(b.company);
        } else if (sortField === "title") {
          cmp = a.title.localeCompare(b.title);
        } else if (sortField === "status") {
          cmp = a.status.localeCompare(b.status);
        } else if (sortField === "dateApplied") {
          const dateA = new Date(a.dateApplied || a.createdAt).getTime();
          const dateB = new Date(b.dateApplied || b.createdAt).getTime();
          cmp = dateA - dateB;
        }
        return sortAsc ? cmp : -cmp;
      });
  }, [applications, statusFilter, search, sortField, sortAsc]);

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company, title, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm h-9"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-1 rounded-lg border text-xs">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? applications.length
                : applications.filter((a) => a.status === f.value).length;
            const isSelected = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1",
                  isSelected
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{f.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        {filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-3 bg-muted rounded-full mb-3">
              <Kanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No applications found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
              {applications.length === 0
                ? "Start tracking your job search by logging your first application!"
                : "No applications match your current search or status filter."}
            </p>
            {applications.length === 0 && (
              <Button size="sm" onClick={onAddNew}>
                Log First Application
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th
                    className="p-3 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("company")}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">
                      Job Title
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3 cursor-pointer hover:text-foreground transition-colors whitespace-nowrap"
                    onClick={() => handleSort("dateApplied")}
                  >
                    <div className="flex items-center gap-1">
                      Date Applied
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3 whitespace-nowrap">CV Used</th>
                  <th
                    className="p-3 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3">Notes</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((app) => (
                  <TrackerRow
                    key={app.id}
                    application={app}
                    linkedCV={app.cvId ? cvMap.get(app.cvId) : undefined}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateNotes={onUpdateNotes}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
