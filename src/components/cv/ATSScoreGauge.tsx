"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ATSScore } from "@/types/cv";

interface ATSScoreGaugeProps {
  score: ATSScore;
}

function getColor(value: number) {
  if (value >= 75) return { stroke: "#22c55e", text: "text-green-500" };
  if (value >= 50) return { stroke: "#eab308", text: "text-yellow-500" };
  return { stroke: "#ef4444", text: "text-red-500" };
}

function CircleGauge({ value }: { value: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stroke } = getColor(value);
  const size = 140;
  const radius = 55;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const startAngle = -Math.PI / 2;
    const targetAngle = startAngle + (value / 100) * 2 * Math.PI;

    let current = startAngle;
    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Background track
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(128,128,128,0.15)";
      ctx.lineWidth = 10;
      ctx.stroke();

      // Progress arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, current);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.stroke();

      if (current < targetAngle) {
        current = Math.min(current + (2 * Math.PI) / 60, targetAngle);
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [value, stroke, cx, cy, radius]);

  const { text } = getColor(value);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} aria-label={`ATS Score: ${value}`} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold tabular-nums", text)}>{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, value, explanation }: { label: string; value: number; explanation: string }) {
  const { stroke, text } = getColor(value);
  return (
    <div className="space-y-1.5" title={explanation}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium tabular-nums", text)}>{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: stroke }}
        />
      </div>
      <p className="text-xs text-muted-foreground/70 leading-snug">{explanation}</p>
    </div>
  );
}

export function ATSScoreGauge({ score }: ATSScoreGaugeProps) {
  const subScores = [
    { label: "Keyword Match", value: score.keywordMatch },
    { label: "Format Compliance", value: score.formatCompliance },
    { label: "Section Completeness", value: score.sectionCompleteness },
    { label: "Readability", value: score.readability },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        <CircleGauge value={score.overall} />
        <p className="text-sm font-medium text-center">
          {score.overall >= 75 ? "Strong Match" : score.overall >= 50 ? "Good Match" : "Needs Improvement"}
        </p>
      </div>

      <div className="space-y-4">
        {subScores.map((s, i) => {
          const detail = score.details?.[i];
          return (
            <SubScoreBar
              key={s.label}
              label={s.label}
              value={s.value}
              explanation={detail?.explanation ?? ""}
            />
          );
        })}
      </div>
    </div>
  );
}
