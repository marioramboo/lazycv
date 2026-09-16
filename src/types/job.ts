export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted';

export interface JobApplication {
  id: string;
  cvId?: string;          // linked GeneratedCV id (optional)
  company: string;
  title: string;
  dateApplied: string;    // ISO date (YYYY-MM-DD)
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
