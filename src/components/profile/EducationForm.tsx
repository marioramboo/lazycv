"use client";

import { useProfileStore } from "@/stores/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";


export function EducationForm() {
  const { education, addEducation, updateEducation, removeEducation, reorderEducation } = useProfileStore();

  const handleAdd = () => {
    addEducation({
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      removeEducation(id);
      toast.success("Entry removed");
    }
  };

  if (education.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <h3 className="text-lg font-medium">No education added yet</h3>
        <p className="text-muted-foreground mb-4">Add your first education entry to get started.</p>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Add Education</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={edu.id} className="relative group">
          <CardContent className="p-6 pt-8 space-y-4">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {index > 0 && (
                <Button variant="ghost" size="icon" onClick={() => reorderEducation(index, index - 1)} title="Move up">
                  ↑
                </Button>
              )}
              {index < education.length - 1 && (
                <Button variant="ghost" size="icon" onClick={() => reorderEducation(index, index + 1)} title="Move down">
                  ↓
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(edu.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution *</Label>
                <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} onBlur={() => toast.success("Saved")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} onBlur={() => toast.success("Saved")} />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} onBlur={() => toast.success("Saved")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date (YYYY-MM)</Label>
                  <Input type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} onBlur={() => toast.success("Saved")} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="month" value={edu.endDate === 'present' ? '' : edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} onBlur={() => toast.success("Saved")} />
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id={`present-${edu.id}`} checked={edu.endDate === 'present'} onChange={(e) => updateEducation(edu.id, { endDate: e.target.checked ? 'present' : '' })} />
                    <Label htmlFor={`present-${edu.id}`} className="font-normal text-sm">Present</Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GPA</Label>
                  <Input value={edu.gpa || ''} onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} onBlur={() => toast.success("Saved")} />
                </div>
                <div className="space-y-2">
                  <Label>Honors</Label>
                  <Input value={edu.honors || ''} onChange={(e) => updateEducation(edu.id, { honors: e.target.value })} onBlur={() => toast.success("Saved")} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleAdd} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Education</Button>
    </div>
  );
}
