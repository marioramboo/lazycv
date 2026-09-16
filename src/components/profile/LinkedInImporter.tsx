"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import JSZip from "jszip";
import Papa from "papaparse";
import { useProfileStore } from "@/stores/profile-store";
import { toast } from "sonner";
import { Experience, Education, Certification, Skill } from "@/types/profile";

export function LinkedInImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useProfileStore();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    let importedCount = 0;
    try {
      const zip = await JSZip.loadAsync(file);

      // Extract Positions
      const positionsFile = zip.file("Positions.csv");
      if (positionsFile) {
        const csvText = await positionsFile.async("string");
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        for (const row of parsed.data as any[]) {
          if (row.Title && row["Company Name"]) {
            store.addExperience({
              id: crypto.randomUUID(),
              title: row.Title,
              company: row["Company Name"],
              startDate: formatDate(row["Started On"]),
              endDate: row["Finished On"] ? formatDate(row["Finished On"]) : "Present",
              bullets: row.Description ? row.Description.split('\n').filter(Boolean) : [],
            } as Experience);
            importedCount++;
          }
        }
      }

      // Extract Education
      const educationFile = zip.file("Education.csv");
      if (educationFile) {
        const csvText = await educationFile.async("string");
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        for (const row of parsed.data as any[]) {
          if (row["School Name"]) {
            store.addEducation({
              id: crypto.randomUUID(),
              institution: row["School Name"],
              degree: row["Degree Name"] || "",
              field: row["Notes"] || "", // LinkedIn sometimes puts field in notes or degree name
              startDate: formatDate(row["Start Date"]),
              endDate: formatDate(row["End Date"]),
            } as Education);
            importedCount++;
          }
        }
      }

      // Extract Certifications
      const certsFile = zip.file("Certifications.csv");
      if (certsFile) {
        const csvText = await certsFile.async("string");
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        for (const row of parsed.data as any[]) {
          if (row.Name) {
            store.addCertification({
              id: crypto.randomUUID(),
              name: row.Name,
              organization: row.Authority || "",
              date: formatDate(row["Started On"]),
              url: row.Url || "",
            } as Certification);
            importedCount++;
          }
        }
      }

      // Extract Skills
      const skillsFile = zip.file("Skills.csv");
      if (skillsFile) {
        const csvText = await skillsFile.async("string");
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        for (const row of parsed.data as any[]) {
          if (row.Name) {
            store.addSkill({
              id: crypto.randomUUID(),
              name: row.Name,
              category: "tools", // Default category
              proficiency: "proficient" // Default proficiency
            } as Skill);
            importedCount++;
          }
        }
      }

      if (importedCount > 0) {
        toast.success(`Successfully imported ${importedCount} profile items from LinkedIn!`);
      } else {
        toast.warning("No relevant profile data found in the selected ZIP file. Are you sure this is a LinkedIn data export?");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to parse LinkedIn export. Make sure you selected the correct ZIP file.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper to format dates from LinkedIn CSV (usually "MMM YYYY") to YYYY-MM
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <>
      <input 
        type="file" 
        accept=".zip" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImport}
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 border-blue-200 hover:bg-blue-50 text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/50 dark:text-blue-400"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import from LinkedIn
      </Button>
    </>
  );
}
