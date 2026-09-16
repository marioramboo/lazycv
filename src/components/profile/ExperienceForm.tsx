"use client";

import { useProfileStore } from "@/stores/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export function ExperienceForm() {
  const { experience, addExperience, updateExperience, removeExperience, reorderExperience } = useProfileStore();

  const handleAdd = () => {
    addExperience({
      id: crypto.randomUUID(),
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      bullets: ['']
    });
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this experience entry?")) {
      removeExperience(id);
      toast.success("Entry removed");
    }
  };

  if (experience.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <h3 className="text-lg font-medium">No work experience added yet</h3>
        <p className="text-muted-foreground mb-4">Add your first experience entry to get started.</p>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Add Experience</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experience.map((exp, index) => (
        <Card key={exp.id} className="relative group">
          <CardContent className="p-6 pt-8 space-y-4">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {index > 0 && (
                <Button variant="ghost" size="icon" onClick={() => reorderExperience(index, index - 1)} title="Move up">
                  ↑
                </Button>
              )}
              {index < experience.length - 1 && (
                <Button variant="ghost" size="icon" onClick={() => reorderExperience(index, index + 1)} title="Move down">
                  ↓
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(exp.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input value={exp.title} onChange={(e) => updateExperience(exp.id, { title: e.target.value })} onBlur={() => toast.success("Saved")} />
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} onBlur={() => toast.success("Saved")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date (YYYY-MM)</Label>
                  <Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} onBlur={() => toast.success("Saved")} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="month" value={exp.endDate === 'present' ? '' : exp.endDate} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} onBlur={() => toast.success("Saved")} />
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id={`present-exp-${exp.id}`} checked={exp.endDate === 'present'} onChange={(e) => updateExperience(exp.id, { endDate: e.target.checked ? 'present' : '' })} />
                    <Label htmlFor={`present-exp-${exp.id}`} className="font-normal text-sm">Present</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Responsibilities & Achievements</Label>
              <div className="space-y-2">
                {exp.bullets.map((bullet, bIndex) => (
                  <div key={bIndex} className="flex items-start gap-2">
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                    <Input 
                      value={bullet} 
                      onChange={(e) => {
                        const newBullets = [...exp.bullets];
                        newBullets[bIndex] = e.target.value;
                        updateExperience(exp.id, { bullets: newBullets });
                      }} 
                      onBlur={() => toast.success("Saved")}
                      placeholder="Led a team of 5 engineers to deliver..."
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        const newBullets = exp.bullets.filter((_, i) => i !== bIndex);
                        updateExperience(exp.id, { bullets: newBullets });
                      }}
                      disabled={exp.bullets.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ''] })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Bullet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleAdd} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Experience</Button>
    </div>
  );
}
