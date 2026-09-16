"use client";

import { useState, useRef } from "react";
import { db } from "@/lib/db";
import { useSettingsStore } from "@/stores/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Download, Upload, Trash2, Database, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    profile?: any[];
    projects?: any[];
    generatedCVs?: any[];
    coverLetters?: any[];
    jobApplications?: any[];
    settings?: any[];
    localStorageSettings?: any;
  };
}

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupData | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [isImporting, setIsImporting] = useState(false);

  // Clear modal state
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  // Counts summary state
  const [dataStats, setDataStats] = useState<{
    profile: number;
    projects: number;
    cvs: number;
    letters: number;
    apps: number;
  } | null>(null);

  // Load current stats for export card
  const loadStats = async () => {
    const pCount = await db.profile.count();
    const projCount = await db.projects.count();
    const cvCount = await db.generatedCVs.count();
    const letterCount = await db.coverLetters.count();
    const appCount = await db.jobApplications.count();
    setDataStats({
      profile: pCount,
      projects: projCount,
      cvs: cvCount,
      letters: letterCount,
      apps: appCount
    });
  };

  const handleExport = async () => {
    try {
      const profile = await db.profile.toArray();
      const projects = await db.projects.toArray();
      const generatedCVs = await db.generatedCVs.toArray();
      const coverLetters = await db.coverLetters.toArray();
      const jobApplications = await db.jobApplications.toArray();
      const settings = await db.settings.toArray();
      const localSettings = localStorage.getItem("lazycv-settings");

      const backup: BackupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          profile,
          projects,
          generatedCVs,
          coverLetters,
          jobApplications,
          settings,
          localStorageSettings: localSettings ? JSON.parse(localSettings) : null
        }
      };

      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split("T")[0];

      const a = document.createElement("a");
      a.href = url;
      a.download = `lazycv_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Export successful! ${generatedCVs.length} CVs, ${projects.length} projects, ${jobApplications.length} applications saved.`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export data");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as BackupData;
        if (!parsed || !parsed.data) {
          throw new Error("Invalid backup file format");
        }
        setPendingBackup(parsed);
        setImportModalOpen(true);
      } catch (err) {
        toast.error("Invalid JSON backup file format");
      }
    };
    reader.readAsText(file);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExecuteImport = async () => {
    if (!pendingBackup || !pendingBackup.data) return;

    setIsImporting(true);
    try {
      const { profile, projects, generatedCVs, coverLetters, jobApplications, settings, localStorageSettings } = pendingBackup.data;

      if (importMode === "replace") {
        await db.profile.clear();
        await db.projects.clear();
        await db.generatedCVs.clear();
        await db.coverLetters.clear();
        await db.jobApplications.clear();
        await db.settings.clear();
      }

      if (profile && profile.length > 0) await db.profile.bulkPut(profile);
      if (projects && projects.length > 0) await db.projects.bulkPut(projects);
      if (generatedCVs && generatedCVs.length > 0) await db.generatedCVs.bulkPut(generatedCVs);
      if (coverLetters && coverLetters.length > 0) await db.coverLetters.bulkPut(coverLetters);
      if (jobApplications && jobApplications.length > 0) await db.jobApplications.bulkPut(jobApplications);
      if (settings && settings.length > 0) await db.settings.bulkPut(settings);

      if (localStorageSettings) {
        localStorage.setItem("lazycv-settings", JSON.stringify(localStorageSettings));
      }

      toast.success("Data imported successfully! Reloading application...");
      setImportModalOpen(false);
      setPendingBackup(null);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Failed to import data into database");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExecuteClear = async () => {
    if (deleteConfirmationText !== "DELETE") {
      toast.error("Please type DELETE to confirm clearing data.");
      return;
    }

    setIsClearing(true);
    try {
      await db.profile.clear();
      await db.projects.clear();
      await db.generatedCVs.clear();
      await db.coverLetters.clear();
      await db.jobApplications.clear();
      await db.settings.clear();
      localStorage.removeItem("lazycv-settings");
      useSettingsStore.getState().resetSettings();

      toast.success("All local data has been permanently cleared.");
      setClearModalOpen(false);
      setDeleteConfirmationText("");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Clear database failed:", err);
      toast.error("Failed to clear database.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Data Management & Portability</CardTitle>
        </div>
        <CardDescription>
          Export complete backups of your CVs, profile, projects, and job applications as JSON. Import or reset anytime.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="default" 
            onClick={handleExport} 
            className="flex-1 gap-2 shadow-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Export All Data (.json)
          </Button>

          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1 gap-2 font-medium"
          >
            <Upload className="h-4 w-4" />
            Import Backup File
          </Button>
        </div>

        {/* Clear Data Danger Zone */}
        <div className="pt-6 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h4>
              <p className="text-xs text-muted-foreground">
                Permanently erase all local IndexedDB tables and reset application state.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setClearModalOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Import Preview Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Confirm Data Import
            </DialogTitle>
            <DialogDescription>
              We inspected your backup file. Below is a breakdown of the content found:
            </DialogDescription>
          </DialogHeader>

          {pendingBackup && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div className="p-2.5 rounded-lg border bg-muted/30 flex justify-between items-center">
                  <span>Generated CVs:</span>
                  <Badge variant="secondary">{pendingBackup.data.generatedCVs?.length || 0}</Badge>
                </div>
                <div className="p-2.5 rounded-lg border bg-muted/30 flex justify-between items-center">
                  <span>Projects:</span>
                  <Badge variant="secondary">{pendingBackup.data.projects?.length || 0}</Badge>
                </div>
                <div className="p-2.5 rounded-lg border bg-muted/30 flex justify-between items-center">
                  <span>Job Applications:</span>
                  <Badge variant="secondary">{pendingBackup.data.jobApplications?.length || 0}</Badge>
                </div>
                <div className="p-2.5 rounded-lg border bg-muted/30 flex justify-between items-center">
                  <span>Cover Letters:</span>
                  <Badge variant="secondary">{pendingBackup.data.coverLetters?.length || 0}</Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold">Import Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportMode("merge")}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      importMode === "merge"
                        ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold"
                        : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-0.5">Merge Data</div>
                    Add or update records without deleting existing ones.
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode("replace")}
                    className={`p-3 text-left rounded-lg border text-xs transition-all ${
                      importMode === "replace"
                        ? "border-destructive bg-destructive/5 ring-1 ring-destructive font-semibold"
                        : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="font-semibold text-destructive mb-0.5">Replace All</div>
                    Clear current database completely before importing.
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteImport} disabled={isImporting} className="gap-2">
              {isImporting ? "Importing..." : "Execute Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Data Modal */}
      <Dialog open={clearModalOpen} onOpenChange={setClearModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Clear All Application Data
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              This action cannot be undone. This will permanently wipe all your saved CVs, projects, profile information, and application logs from IndexedDB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="delete-confirm" className="text-xs">
              To confirm, type <span className="font-mono font-bold text-destructive">DELETE</span> below:
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="font-mono text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setClearModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleExecuteClear} 
              disabled={deleteConfirmationText !== "DELETE" || isClearing}
            >
              {isClearing ? "Clearing..." : "Permanently Clear Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
