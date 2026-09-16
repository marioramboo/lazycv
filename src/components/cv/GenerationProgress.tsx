"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface GenerationProgressProps {
  currentStep: number;
  stepName: string;
  totalSteps: number;
  error?: string | null;
}

const STEPS = [
  "Analyzing job description",
  "Selecting relevant projects",
  "Writing CV content",
  "Writing professional summary",
  "Optimizing for ATS",
  "Scoring ATS compatibility",
  "Generating recommendations",
];

export function GenerationProgress({ currentStep, stepName, totalSteps, error }: GenerationProgressProps) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const startTimes = useRef<Record<number, number>>({});

  useEffect(() => {
    if (currentStep > 0 && !startTimes.current[currentStep]) {
      startTimes.current[currentStep] = Date.now();
    }
  }, [currentStep]);

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stepName || "Starting…"}</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const isPending = currentStep < stepNum;
          const hasError = error && isActive;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 text-sm transition-all",
                isPending && "text-muted-foreground/50",
                isActive && "text-foreground",
                isDone && "text-muted-foreground"
              )}
            >
              <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                {hasError ? (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                ) : isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span className={cn(isActive && "font-medium")}>{step}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
