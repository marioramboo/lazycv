"use client";

import { useProfileStore } from "@/stores/profile-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format").or(z.literal('')),
  phone: z.string(),
  city: z.string(),
  country: z.string(),
  linkedinUrl: z.string().url("Invalid URL").or(z.literal('')),
  websiteUrl: z.string().url("Invalid URL").or(z.literal('')),
});

export function PersonalInfoForm() {
  const { personalInfo, updatePersonalInfo } = useProfileStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldSchema = personalInfoSchema.pick({ [name]: true } as any);
      fieldSchema.parse({ [name]: value });
      setErrors((prev) => ({ ...prev, [name]: '' }));
      toast.success("Saved");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.issues?.[0]?.message) {
        setErrors((prev) => ({ ...prev, [name]: err.issues[0].message }));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Basic details to include on your CV.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" name="fullName" value={personalInfo.fullName} onChange={handleChange} onBlur={handleBlur} />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={personalInfo.email} onChange={handleChange} onBlur={handleBlur} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={personalInfo.phone} onChange={handleChange} onBlur={handleBlur} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={personalInfo.city} onChange={handleChange} onBlur={handleBlur} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" value={personalInfo.country} onChange={handleChange} onBlur={handleBlur} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." value={personalInfo.linkedinUrl} onChange={handleChange} onBlur={handleBlur} />
            {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website / Portfolio URL</Label>
            <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://..." value={personalInfo.websiteUrl} onChange={handleChange} onBlur={handleBlur} />
            {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
