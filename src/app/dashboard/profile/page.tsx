"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/stores/profile-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { EducationForm } from "@/components/profile/EducationForm";
import { ExperienceForm } from "@/components/profile/ExperienceForm";
import { SkillsBank } from "@/components/profile/SkillsBank";
import { CertificationsForm } from "@/components/profile/CertificationsForm";
import { Badge } from "@/components/ui/badge";
import { LinkedInImporter } from "@/components/profile/LinkedInImporter";

export default function ProfilePage() {
  const { isLoaded, lastSaved, loadProfile, education, experience, skills, certifications } = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!isLoaded) return <div className="p-8 text-muted-foreground animate-pulse">Loading profile...</div>;

  const getCompletionPercentage = () => {
    let score = 0;
    if (useProfileStore.getState().personalInfo.fullName) score += 20;
    if (education.length > 0) score += 20;
    if (experience.length > 0) score += 20;
    if (skills.length > 0) score += 20;
    if (certifications.length > 0) score += 20;
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your CV data. Auto-saved locally.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="outline" className="text-muted-foreground bg-muted/50">
            {getCompletionPercentage()}% Complete
          </Badge>
          <LinkedInImporter />
          {lastSaved && (
            <span className="text-muted-foreground text-xs">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card shadow-sm">
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="education" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card shadow-sm">
            Education {education.length > 0 && `(${education.length})`}
          </TabsTrigger>
          <TabsTrigger value="experience" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card shadow-sm">
            Experience {experience.length > 0 && `(${experience.length})`}
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card shadow-sm">
            Skills {skills.length > 0 && `(${skills.length})`}
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card shadow-sm">
            Certifications {certifications.length > 0 && `(${certifications.length})`}
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="personal"><PersonalInfoForm /></TabsContent>
          <TabsContent value="education"><EducationForm /></TabsContent>
          <TabsContent value="experience"><ExperienceForm /></TabsContent>
          <TabsContent value="skills"><SkillsBank /></TabsContent>
          <TabsContent value="certifications"><CertificationsForm /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
