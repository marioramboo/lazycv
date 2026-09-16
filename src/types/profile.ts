export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export interface Education {
  id: string;           // uuid
  institution: string;
  degree: string;
  field: string;
  startDate: string;    // YYYY-MM format
  endDate: string;      // YYYY-MM or "present"
  gpa?: string;
  honors?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;      // or "present"
  bullets: string[];    // responsibility/achievement bullet points
}

export type SkillCategory = 'languages' | 'frameworks' | 'tools' | 'soft_skills';
export type SkillProficiency = 'proficient' | 'familiar' | 'learning';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
  url?: string;
}

export interface UserProfile {
  id?: string;          // Using string 'default' as we will just store one profile
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  certifications: Certification[];
  updatedAt: string;    // ISO timestamp
}
