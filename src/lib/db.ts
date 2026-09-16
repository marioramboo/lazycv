import Dexie, { type Table } from 'dexie';

import { UserProfile } from '../types/profile';
import { Project } from '../types/project';
import { GeneratedCV, CoverLetter } from '../types/cv';
import { JobApplication } from '../types/job';
export interface Settings { id: string; aiProvider: string; apiKey: string; theme: string; }

export class LazyCVDatabase extends Dexie {
  profile!: Table<UserProfile, string>;
  projects!: Table<Project, string>;
  generatedCVs!: Table<GeneratedCV, string>;
  coverLetters!: Table<CoverLetter, string>;
  jobApplications!: Table<JobApplication, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('LazyCV');
    this.version(1).stores({
      profile: 'id',
      projects: 'id, pinned, hidden',
      generatedCVs: 'id, createdAt',
      coverLetters: 'id, cvId, createdAt',
      jobApplications: 'id, cvId, status, dateApplied',
      settings: 'id'
    });
    // Version 2: GeneratedCV schema upgraded to sprint-4 rich structure
    this.version(2).stores({
      profile: 'id',
      projects: 'id, pinned, hidden',
      generatedCVs: 'id, jobTitle, company, createdAt',
      coverLetters: 'id, cvId, createdAt',
      jobApplications: 'id, cvId, status, dateApplied',
      settings: 'id'
    });
  }
}
export const db = new LazyCVDatabase();
