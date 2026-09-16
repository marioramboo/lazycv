"use client";

import { useProfileStore } from "@/stores/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { SkillCategory, SkillProficiency } from "@/types/profile";

export function SkillsBank() {
  const { skills, addSkill, removeSkill, updateSkill } = useProfileStore();
  const [newSkillName, setNewSkillName] = useState('');

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkillName.trim() !== '') {
      e.preventDefault();
      
      // Auto-detect category (very naive ponytail approach)
      let category: SkillCategory = 'tools';
      const lowerName = newSkillName.toLowerCase();
      if (['js', 'javascript', 'python', 'java', 'c++', 'ruby', 'go', 'rust', 'typescript'].includes(lowerName)) category = 'languages';
      else if (['react', 'vue', 'angular', 'nextjs', 'node', 'express', 'django', 'spring'].includes(lowerName)) category = 'frameworks';
      else if (['leadership', 'communication', 'teamwork', 'agile'].includes(lowerName)) category = 'soft_skills';

      addSkill({
        id: crypto.randomUUID(),
        name: newSkillName.trim(),
        category,
        proficiency: 'familiar'
      });
      setNewSkillName('');
      toast.success("Skill added");
    }
  };

  const categories: { key: SkillCategory, label: string }[] = [
    { key: 'languages', label: 'Programming Languages' },
    { key: 'frameworks', label: 'Frameworks & Libraries' },
    { key: 'tools', label: 'Tools & Platforms' },
    { key: 'soft_skills', label: 'Soft Skills' }
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="quick-add">Quick Add Skill</Label>
          <div className="flex gap-2">
            <Input 
              id="quick-add"
              placeholder="Type a skill and press Enter..." 
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={handleQuickAdd}
            />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Button onClick={() => handleQuickAdd({ key: 'Enter', preventDefault: () => {} } as any)} disabled={!newSkillName.trim()}>
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Defaults to &apos;Familiar&apos; proficiency.</p>
        </div>

        <div className="space-y-6">
          {categories.map(cat => {
            const catSkills = skills.filter(s => s.category === cat.key);
            if (catSkills.length === 0) return null;
            return (
              <div key={cat.key} className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{cat.label}</h4>
                <div className="flex flex-wrap gap-2">
                  {catSkills.map(skill => (
                    <div key={skill.id} className="group flex items-center bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm border hover:border-primary/50 transition-colors">
                      <span className="font-medium mr-2">{skill.name}</span>
                      <select 
                        value={skill.proficiency}
                        onChange={(e) => updateSkill(skill.id, { proficiency: e.target.value as SkillProficiency })}
                        className="bg-transparent text-xs text-muted-foreground focus:outline-none appearance-none cursor-pointer hover:text-foreground"
                      >
                        <option value="learning">Learning</option>
                        <option value="familiar">Familiar</option>
                        <option value="proficient">Proficient</option>
                      </select>
                      <button 
                        onClick={() => removeSkill(skill.id)}
                        className="ml-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
