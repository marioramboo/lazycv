"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useId } from "react";

interface DraggableBulletProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}

export function DraggableBullets({ bullets, onChange }: DraggableBulletProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = bullets.findIndex((_, i) => String(i) === active.id);
    const newIdx = bullets.findIndex((_, i) => String(i) === over.id);
    onChange(arrayMove(bullets, oldIdx, newIdx));
  }

  function updateBullet(idx: number, value: string) {
    const next = [...bullets];
    next[idx] = value;
    onChange(next);
  }

  function removeBullet(idx: number) {
    onChange(bullets.filter((_, i) => i !== idx));
  }

  function addBullet() {
    onChange([...bullets, ""]);
  }

  const ids = bullets.map((_, i) => String(i));

  return (
    <div className="space-y-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {bullets.map((bullet, i) => (
            <SortableBullet
              key={i}
              id={String(i)}
              value={bullet}
              onChange={(v) => updateBullet(i, v)}
              onRemove={() => removeBullet(i)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground" onClick={addBullet}>
        <Plus className="h-3.5 w-3.5" /> Add bullet
      </Button>
    </div>
  );
}

function SortableBullet({
  id, value, onChange, onRemove,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const uid = useId();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1.5 group ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground p-0.5 rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Input
        id={`bullet-${uid}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs flex-1"
        placeholder="Add a bullet point…"
      />
      <Button
        type="button" variant="ghost" size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label="Remove bullet"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
