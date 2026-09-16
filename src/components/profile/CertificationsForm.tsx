"use client";

import { useProfileStore } from "@/stores/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CertificationsForm() {
  const { certifications, addCertification, updateCertification, removeCertification } = useProfileStore();

  const handleAdd = () => {
    addCertification({
      id: crypto.randomUUID(),
      name: '',
      organization: '',
      date: '',
      url: ''
    });
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this certification?")) {
      removeCertification(id);
      toast.success("Entry removed");
    }
  };

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <h3 className="text-lg font-medium">No certifications added yet</h3>
        <p className="text-muted-foreground mb-4">Add your first certification to get started.</p>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Add Certification</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certifications.map((cert) => (
        <Card key={cert.id} className="relative group">
          <CardContent className="p-6 space-y-4">
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemove(cert.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification Name *</Label>
                <Input value={cert.name} onChange={(e) => updateCertification(cert.id, { name: e.target.value })} onBlur={() => toast.success("Saved")} />
              </div>
              <div className="space-y-2">
                <Label>Issuing Organization *</Label>
                <Input value={cert.organization} onChange={(e) => updateCertification(cert.id, { organization: e.target.value })} onBlur={() => toast.success("Saved")} />
              </div>
              <div className="space-y-2">
                <Label>Date Obtained (YYYY-MM)</Label>
                <Input type="month" value={cert.date} onChange={(e) => updateCertification(cert.id, { date: e.target.value })} onBlur={() => toast.success("Saved")} />
              </div>
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input type="url" value={cert.url || ''} onChange={(e) => updateCertification(cert.id, { url: e.target.value })} onBlur={() => toast.success("Saved")} placeholder="https://..." />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleAdd} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Certification</Button>
    </div>
  );
}
