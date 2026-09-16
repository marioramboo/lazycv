import { AIProvider } from '@/types/ai';
import { UserProfile } from '@/types/profile';
import { Project } from '@/types/project';
import { GeneratedCV, ParsedJob, CVSection, ATSScore, Recommendation } from '@/types/cv';
import {
  buildJobAnalysisPrompt,
  buildProjectSelectionPrompt,
  buildCVContentPrompt,
  buildSummaryPrompt,
  buildATSOptimizationPrompt,
  buildATSScoringPrompt,
  buildRecommendationsPrompt,
  buildSingleProjectOptimizationPrompt,
} from './prompts';

export type ProgressCallback = (step: number, stepName: string) => void;

/** Extract JSON from a raw AI response — handles markdown code fences and trailing text. */
function parseJSON<T>(raw: string): T {
  // 1. Try to extract content from markdown code fences first
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim());
  }

  // 2. Strip any leading/trailing non-JSON text by finding the first { or [
  const trimmed = raw.trim();
  const objStart = trimmed.indexOf('{');
  const arrStart = trimmed.indexOf('[');
  let start = -1;

  if (objStart === -1 && arrStart === -1) {
    // No JSON structure found, try raw parse as last resort
    return JSON.parse(trimmed);
  }

  if (objStart === -1) start = arrStart;
  else if (arrStart === -1) start = objStart;
  else start = Math.min(objStart, arrStart);

  const isArray = trimmed[start] === '[';
  const closeChar = isArray ? ']' : '}';

  // Find matching close by counting nesting
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        return JSON.parse(trimmed.slice(start, i + 1));
      }
    }
  }

  // Fallback: just try from start to end
  return JSON.parse(trimmed.slice(start));
}

/** If AI wraps an array in an object (e.g. {sections:[...]}), unwrap it. */
function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const first = Object.values(value as Record<string, unknown>).find(Array.isArray);
    if (first) return first as T[];
  }
  return [];
}

/** Call AI and parse JSON with up to 3 retries and exponential backoff. */
async function aiJSON<T>(ai: AIProvider, prompt: string, systemPrompt?: string): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        // Wait 2s on 1st retry, 4s on 2nd retry to clear provider rate limits (503 / ResourceExhausted)
        const backoffMs = attempt * 2000;
        console.log(`[aiJSON] Backing off ${backoffMs}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
      const t0 = Date.now();
      console.log(`[aiJSON] attempt ${attempt + 1}/3 starting...`);
      const raw = await ai.generate(prompt, systemPrompt);
      console.log(`[aiJSON] attempt ${attempt + 1}/3 got response in ${Date.now() - t0}ms (${raw.length} chars)`);
      return parseJSON<T>(raw);
    } catch (e) {
      lastError = e as Error;
      console.error(`[aiJSON] attempt ${attempt + 1}/3 failed:`, lastError.message);
    }
  }
  throw lastError;
}

const SYSTEM = 'You are an expert ATS-optimized CV writer. Always respond with valid JSON only. CRITICAL: Use ONLY the candidate data provided. Do NOT invent, fabricate, or hallucinate any experience, skills, projects, or certifications.';

export async function generateCV(
  jobText: string,
  profile: UserProfile,
  projects: Project[],
  ai: AIProvider,
  onProgress: ProgressCallback
): Promise<GeneratedCV> {
  // Step 1: Analyze job
  onProgress(1, 'Analyzing job description');
  const parsedJob = await aiJSON<ParsedJob>(ai, buildJobAnalysisPrompt(jobText), SYSTEM);
  parsedJob.rawText = jobText;

  // Step 2: Select projects
  onProgress(2, 'Selecting relevant projects');
  const visibleProjects = projects.filter(p => !p.hidden);
  let selectedProjects: Project[] = [];
  if (visibleProjects.length > 0) {
    try {
      const idsResult = await aiJSON<string[]>(ai, buildProjectSelectionPrompt(parsedJob, visibleProjects), SYSTEM);
      const rawIds = Array.isArray(idsResult) ? idsResult.slice(0, 5) : [];
      console.log('[generateCV] AI returned project IDs:', rawIds);

      // Try matching by exact ID first
      selectedProjects = visibleProjects.filter(p => rawIds.includes(p.id));

      // Fallback: AI may have returned numeric indices instead of UUIDs
      if (selectedProjects.length === 0 && rawIds.length > 0) {
        console.log('[generateCV] No exact ID match — trying index fallback');
        const indices = rawIds
          .map(v => parseInt(v, 10))
          .filter(n => !isNaN(n) && n >= 0 && n < visibleProjects.length);
        selectedProjects = indices.map(i => visibleProjects[i]);
      }

      // Fallback: AI may have returned project names
      if (selectedProjects.length === 0 && rawIds.length > 0) {
        console.log('[generateCV] No index match — trying name fallback');
        selectedProjects = visibleProjects.filter(p =>
          rawIds.some(id => p.name.toLowerCase().includes(id.toLowerCase()) || id.toLowerCase().includes(p.name.toLowerCase()))
        ).slice(0, 5);
      }
    } catch (e) {
      console.error('[generateCV] Project selection failed, using top 5:', e);
      selectedProjects = visibleProjects.slice(0, 5);
    }
  }
  const selectedIds = selectedProjects.map(p => p.id);
  console.log(`[generateCV] Selected ${selectedProjects.length} projects:`, selectedProjects.map(p => p.name));

  // Step 3: Write CV content
  onProgress(3, 'Writing CV content');
  // ponytail: ensureArray unwraps {sections:[...]} which some models return
  let sections = ensureArray<CVSection>(await aiJSON<unknown>(ai, buildCVContentPrompt(parsedJob, profile, selectedProjects), SYSTEM));

  // Step 4: Write summary and prepend
  onProgress(4, 'Writing professional summary');
  const summaryResult = await aiJSON<{ summary: string }>(ai, buildSummaryPrompt(parsedJob, sections), SYSTEM);
  const summarySection: CVSection = {
    id: crypto.randomUUID(),
    type: 'summary',
    title: 'Professional Summary',
    content: { text: summaryResult.summary },
  };
  sections = [summarySection, ...sections.filter(s => s.type !== 'summary')];

  // Step 5: ATS optimization
  onProgress(5, 'Optimizing for ATS');
  try {
    const rawOptimized = await aiJSON<unknown>(ai, buildATSOptimizationPrompt(parsedJob, sections), SYSTEM);
    const optimizedSections = ensureArray<CVSection>(rawOptimized);
    
    // Safety check: ensure all essential section types (skills, experience, projects, education, certifications) exist
    const originalTypes = new Set(sections.map(s => s.type));
    const optimizedTypes = new Set(optimizedSections.map(s => s.type));
    const missingTypes = Array.from(originalTypes).filter(t => !optimizedTypes.has(t));

    if (missingTypes.length > 0) {
      console.warn(`[generateCV] ATS optimization lost sections: ${missingTypes.join(', ')}. Keeping original sections.`);
    } else {
      sections = optimizedSections;
    }
  } catch (e) {
    console.warn('[generateCV] ATS optimization skipped due to error, keeping original sections:', e);
  }

  // Step 6: Score
  onProgress(6, 'Scoring ATS compatibility');
  const atsScore = await aiJSON<ATSScore>(ai, buildATSScoringPrompt(parsedJob, sections), SYSTEM);

  // Step 7: Recommendations
  onProgress(7, 'Generating recommendations');
  const recommendations = await aiJSON<Recommendation[]>(ai, buildRecommendationsPrompt(parsedJob, profile, sections), SYSTEM);

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    jobTitle: parsedJob.title,
    company: parsedJob.companyName ?? '',
    jobDescription: jobText,
    parsedJob,
    sections,
    selectedProjectIds: selectedIds,
    templateId: 'default',
    atsScore,
    recommendations: Array.isArray(recommendations) ? recommendations : [],
    optimizationCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export async function reOptimize(
  cv: GeneratedCV,
  ai: AIProvider,
  onProgress: ProgressCallback
): Promise<GeneratedCV> {
  onProgress(5, 'Polishing grammar & ATS optimizing sections');
  const optimizedSections = await aiJSON<CVSection[]>(ai, buildATSOptimizationPrompt(cv.parsedJob, cv.sections), SYSTEM);
  const sections = Array.isArray(optimizedSections) && optimizedSections.length > 0 ? optimizedSections : cv.sections;

  onProgress(6, 'Re-scoring ATS & updating recommendations');
  const atsScore = await aiJSON<ATSScore>(ai, buildATSScoringPrompt(cv.parsedJob, sections), SYSTEM);
  
  let recommendations = cv.recommendations;
  try {
    const freshRecs = await aiJSON<Recommendation[]>(
      ai,
      buildRecommendationsPrompt(cv.parsedJob, {} as any, sections),
      SYSTEM
    );
    if (Array.isArray(freshRecs) && freshRecs.length > 0) {
      recommendations = freshRecs;
    }
  } catch (e) {
    console.warn('Failed to update recommendations during re-optimization', e);
  }

  return {
    ...cv,
    sections,
    atsScore,
    recommendations,
    optimizationCount: cv.optimizationCount + 1,
    updatedAt: new Date().toISOString(),
  };
}

export async function scoreCV(
  cv: GeneratedCV,
  ai: AIProvider
): Promise<ATSScore> {
  const atsScore = await aiJSON<ATSScore>(ai, buildATSScoringPrompt(cv.parsedJob, cv.sections), SYSTEM);
  return atsScore;
}

export async function optimizeSingleProject(
  parsedJob: ParsedJob,
  project: { name: string; description: string; techStack: string[] },
  ai: AIProvider
) {
  return await aiJSON<{ name: string; description: string; techStack: string[]; impact?: string; bullets: string[] }>(
    ai,
    buildSingleProjectOptimizationPrompt(parsedJob, project),
    SYSTEM
  );
}
