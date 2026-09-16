"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/db";
import { useProfileStore } from "@/stores/profile-store";
import { useCVStore } from "@/stores/cv-store";
import { CVEditor } from "@/components/editor/CVEditor";
import { GeneratedCV } from "@/types/cv";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const profile = useProfileStore();

  const [cv, setCV] = useState<GeneratedCV | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Keep original snapshot for "Reset to AI version"
  const originalRef = useRef<GeneratedCV | null>(null);

  useEffect(() => {
    profile.loadProfile();
  }, [profile]);

  useEffect(() => {
    if (!params.id) return;
    db.generatedCVs.get(params.id).then((found) => {
      if (!found) { setNotFound(true); return; }
      setCV(found);
      originalRef.current ??= structuredClone(found);
      // Also hydrate the CV store so updateSection works
      useCVStore.setState({ currentCV: found });
    });
  }, [params.id]);

  // Keep local state in sync with store updates (from CVEditor's updateSection calls)
  useEffect(() => {
    return useCVStore.subscribe((state) => {
      if (state.currentCV && state.currentCV.id === params.id) {
        setCV(state.currentCV);
      }
    });
  }, [params.id]);

  const contact = {
    name: profile.personalInfo.fullName || "Your Name",
    email: profile.personalInfo.email,
    phone: profile.personalInfo.phone,
    city: profile.personalInfo.city,
    linkedinUrl: profile.personalInfo.linkedinUrl,
    websiteUrl: profile.personalInfo.websiteUrl,
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-xl font-semibold">CV not found</p>
        <p className="text-muted-foreground text-sm">This CV may have been deleted.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Back to Dashboard</Link>
      </div>
    );
  }

  if (!cv || !profile.isLoaded) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading CV…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/generate" className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Generate
        </Link>
        <span className="text-muted-foreground/50">|</span>
        <h1 className="text-lg font-semibold truncate">{cv.jobTitle}</h1>
        {cv.company && <span className="text-muted-foreground text-sm">@ {cv.company}</span>}
      </div>

      <CVEditor
        cv={cv}
        contact={contact}
        originalCV={originalRef.current!}
      />
    </div>
  );
}
