import { AIProvider } from '@/types/ai';
import { GeneratedCV, CoverLetter } from '@/types/cv';
import { UserProfile } from '@/types/profile';
import { Project } from '@/types/project';
import { buildCoverLetterPrompt } from './prompts';

// ponytail: cover letter is plain text, not JSON — no parsing needed
export async function generateCoverLetter(
  cv: GeneratedCV,
  profile: UserProfile,
  projects: Project[],
  ai: AIProvider
): Promise<CoverLetter> {
  const selectedProjects = cv.selectedProjectIds && cv.selectedProjectIds.length > 0
    ? projects.filter(p => cv.selectedProjectIds.includes(p.id))
    : projects;

  const prompt = buildCoverLetterPrompt(
    cv.parsedJob,
    profile,
    selectedProjects,
    cv.company || cv.parsedJob.companyName || 'the company'
  );

  const content = await ai.generate(prompt);

  return {
    id: crypto.randomUUID(),
    cvId: cv.id,
    content: content.trim(),
    companyName: cv.company || cv.parsedJob.companyName || '',
    jobTitle: cv.jobTitle,
    createdAt: new Date().toISOString(),
  };
}
