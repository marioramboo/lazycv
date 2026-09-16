"use client";

import { useEffect, useState } from "react";
import { useTrackerStore } from "@/stores/tracker-store";
import { JobApplication } from "@/types/job";
import { GeneratedCV } from "@/types/cv";
import { db } from "@/lib/db";
import { TrackerTable } from "@/components/tracker/TrackerTable";
import { ApplicationDialog } from "@/components/tracker/ApplicationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Kanban, Send, Users, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { statusBadgeClass } from "@/components/tracker/TrackerRow";

export default function TrackerPage() {
  const { applications, loadApplications, addApplication, updateApplication, deleteApplication } = useTrackerStore();
  const [cvs, setCvs] = useState<GeneratedCV[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  useEffect(() => {
    loadApplications();
    db.generatedCVs.toArray().then(setCvs).catch(console.error);
  }, [loadApplications]);

  const handleOpenAdd = () => {
    setEditingApp(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (app: JobApplication) => {
    setEditingApp(app);
    setDialogOpen(true);
  };

  const handleSave = async (data: Omit<JobApplication, "id" | "createdAt" | "updatedAt">) => {
    if (editingApp?.id) {
      await updateApplication(editingApp.id, data);
    } else {
      await addApplication(data);
    }
  };

  // Stats calculation
  const total = applications.length;
  const appliedCount = applications.filter((a) => a.status === "applied").length;
  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const offerCount = applications.filter((a) => a.status === "offer").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;
  const ghostedCount = applications.filter((a) => a.status === "ghosted").length;

  const stats = [
    { label: "Total Tracked", count: total, icon: Kanban, badge: "bg-primary/10 text-primary border-primary/20" },
    { label: "Applied", count: appliedCount, icon: Send, badge: statusBadgeClass("applied") },
    { label: "Interview", count: interviewCount, icon: Users, badge: statusBadgeClass("interview") },
    { label: "Offer", count: offerCount, icon: CheckCircle, badge: statusBadgeClass("offer") },
    { label: "Rejected", count: rejectedCount, icon: XCircle, badge: statusBadgeClass("rejected") },
    { label: "Ghosted", count: ghostedCount, icon: HelpCircle, badge: statusBadgeClass("ghosted") },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Application Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track your job search progress, linked CVs, status updates, and notes.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((st) => (
          <Card key={st.label} className="bg-card">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">{st.label}</p>
                <p className="text-xl font-bold mt-0.5">{st.count}</p>
              </div>
              <div className={`p-2 rounded-md ${st.badge}`}>
                <st.icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table */}
      <TrackerTable
        applications={applications}
        cvs={cvs}
        onUpdateStatus={(id, status) => updateApplication(id, { status })}
        onUpdateNotes={(id, notes) => updateApplication(id, { notes })}
        onEdit={handleOpenEdit}
        onDelete={deleteApplication}
        onAddNew={handleOpenAdd}
      />

      {/* Add / Edit Dialog */}
      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingApp}
        onSave={handleSave}
      />
    </div>
  );
}
