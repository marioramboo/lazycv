export interface Project {
  id: string; // The DB interface specifies id as string (UUID or GitHub repo ID as string)
  name: string;
  description: string;
  originalDescription?: string; // from GitHub, preserved for reset
  readme?: string;              // raw README.md content from GitHub
  techStack: string[];
  source: 'github' | 'manual';
  pinned: boolean;
  hidden: boolean;
  githubUrl?: string;
  topics?: string[];
  primaryLanguage?: string;
  role?: string;
  impact?: string;
  createdAt: string;
  updatedAt: string;
}
