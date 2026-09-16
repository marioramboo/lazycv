"use client";

import { TEMPLATES, TemplateContact } from "./index";
import { GeneratedCV } from "@/types/cv";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  cv: GeneratedCV;
  contact: TemplateContact;
  selectedId: string;
  recommendedId: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ cv, contact, selectedId, recommendedId, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</p>
      <div className="grid grid-cols-1 gap-2">
        {TEMPLATES.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          const isRecommended = recommendedId === tpl.id;

          return (
            <button
              key={tpl.id}
              id={`template-${tpl.id}`}
              onClick={() => onSelect(tpl.id)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary/50",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card",
              )}
            >
              {/* Color swatch */}
              <div
                className="mt-0.5 h-8 w-6 shrink-0 rounded-sm border border-border/60"
                style={{ background: tpl.accent }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{tpl.label}</span>
                  {isRecommended && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                      ✦ AI Pick
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">{tpl.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live mini-preview */}
      <div className="mt-3 rounded-lg border bg-white overflow-hidden" style={{ height: 200 }}>
        <div
          className="origin-top-left pointer-events-none select-none"
          style={{ transform: "scale(0.25)", width: "400%", height: "400%" }}
          aria-hidden="true"
        >
          {(() => {
            const tpl = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];
            const C = tpl.component;
            return <C cv={cv} {...contact} />;
          })()}
        </div>
      </div>
    </div>
  );
}
