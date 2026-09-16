export interface ParsedJob {
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  seniorityLevel: string;
  industry: string;
  companyName?: string;
  rawText: string;
}

export interface CVSection {
  id: string;
  type: 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'custom' | string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export interface ATSScore {
  overall: number;
  keywordMatch: number;
  formatCompliance: number;
  sectionCompleteness: number;
  readability: number;
  details: { category: string; score: number; explanation: string }[];
}

export interface Recommendation {
  id: string;
  what: string;
  why: string;
  howToFix: string;
  resources: { title: string; url: string }[];
  impact: 'high' | 'medium' | 'low';
}

export interface GeneratedCV {
  id: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  parsedJob: ParsedJob;
  sections: CVSection[];
  selectedProjectIds: string[];
  templateId: string;
  atsScore: ATSScore;
  recommendations: Recommendation[];
  optimizationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  cvId: string;
  content: string;       // the full cover letter text
  companyName: string;
  jobTitle: string;
  createdAt: string;
}
