import { UserProfile } from '@/types/profile';
import { Project } from '@/types/project';
import { ParsedJob, CVSection } from '@/types/cv';

const JSON_INSTRUCTION = 'Respond with ONLY valid JSON, no markdown code blocks, no explanation.';

export function buildJobAnalysisPrompt(jobText: string): string {
  return `${JSON_INSTRUCTION}

Analyze this job posting and extract structured data. Return a JSON object with exactly these fields:
{
  "title": "job title",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1"],
  "responsibilities": ["responsibility1"],
  "seniorityLevel": "junior|mid|senior|lead|principal",
  "industry": "industry name",
  "companyName": "company name or empty string",
  "rawText": ""
}

Job posting:
${(jobText || '').substring(0, 4000)}`;
}

export function buildProjectSelectionPrompt(parsedJob: ParsedJob, projects: Project[]): string {
  const projectList = projects.map(p =>
    `- ID: "${p.id}" | Name: "${p.name}" | Tech: [${(p.techStack || []).join(', ')}] | Description: "${(p.description || '').substring(0, 200)}"`
  ).join('\n');

  return `${JSON_INSTRUCTION}

Select the 3-5 most relevant projects for this job. Return a JSON array containing ONLY the ID strings from the list below.
You MUST copy the exact ID value from each project's "ID:" field. Do NOT return index numbers.

Example response format: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"]

Job requires: ${parsedJob.requiredSkills.join(', ')}
Role: ${parsedJob.title} (${parsedJob.seniorityLevel})

Available projects:
${projectList}`;
}

export function buildCVContentPrompt(parsedJob: ParsedJob, profile: UserProfile, selectedProjects: Project[]): string {
  // Pass FULL experience data so the model doesn't need to invent anything
  const expEntries = profile.experience.map(e =>
    `  - title: "${e.title}", company: "${e.company}", startDate: "${e.startDate || ''}", endDate: "${e.endDate || 'Present'}", bullets: ${JSON.stringify(e.bullets)}`
  ).join('\n');

  const eduEntries = profile.education.map(e =>
    `  - institution: "${e.institution}", degree: "${e.degree}", field: "${e.field}", startDate: "${e.startDate || ''}", endDate: "${e.endDate || ''}"${e.gpa ? `, gpa: "${e.gpa}"` : ''}`
  ).join('\n');

  const certEntries = profile.certifications.map(c =>
    `  - name: "${c.name}", organization: "${c.organization}", date: "${c.date || ''}"${c.url ? `, url: "${c.url}"` : ''}`
  ).join('\n');

  const skillsList = profile.skills.map(s => s.name).join(', ');

  // Pass RICH project data including README content for detailed bullet generation
  const projectEntries = selectedProjects.map(p => {
    const readmeExcerpt = p.readme
      ? `\n    README excerpt: "${p.readme.replace(/[#*`\n]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 600)}"`
      : '';
    const topics = (p.topics && p.topics.length > 0) ? `\n    Topics: [${p.topics.join(', ')}]` : '';
    return `  - name: "${p.name}"
    description: "${(p.description || '').substring(0, 400)}"
    techStack: [${(p.techStack || []).map(t => `"${t}"`).join(', ')}]${p.impact ? `\n    impact: "${p.impact}"` : ''}${p.role ? `\n    role: "${p.role}"` : ''}${p.githubUrl ? `\n    githubUrl: "${p.githubUrl}"` : ''}${topics}${readmeExcerpt}`;
  }).join('\n\n');

  return `${JSON_INSTRUCTION}

You are generating ATS-optimized CV sections as a JSON array.

CRITICAL RULES — FOLLOW EXACTLY:
1. DO NOT INVENT, FABRICATE, OR HALLUCINATE any information. Use ONLY the candidate data provided below.
2. Every experience entry MUST come from the "EXPERIENCE" list below. Do NOT add jobs, companies, or titles that are not listed.
3. Every education entry MUST come from the "EDUCATION" list below. Do NOT invent degrees or institutions.
4. Every skill MUST come from the "SKILLS" list below. Do NOT add skills the candidate hasn't listed.
5. Every project MUST come from the "PROJECTS" list below. Do NOT invent projects.
6. Every certification MUST come from the "CERTIFICATIONS" list below. Do NOT invent certifications.
7. Experience bullets MUST be an array of short strings (bullet points), NOT paragraph text. Each bullet is one concise achievement sentence starting with an action verb.
8. You MAY rephrase the candidate's existing bullet points to better match the job keywords, but you must NOT change the factual content.
9. You MUST include ALL sections that have data: skills, experience, projects, education, and certifications.

PROJECT BULLET POINT RULES:
- Each project MUST have 3-4 detailed bullet points in the "bullets" array.
- MANDATORY QUANTIFIABLE METRICS: At least 2 bullet points per project MUST include concrete numbers, percentages, dataset sizes, or measurable technical achievements (e.g. "achieving 94.5% accuracy", "trained on 10,000+ samples", "reduced inference time by 30%", "processed 5,000+ requests/sec").
- Start every bullet with a strong action verb (Trained, Architected, Engineered, Developed, Built, Optimized, Deployed, Benchmarked).
- Specify exact models, techniques, and tools used (e.g., GANs, PyTorch, TensorFlow, OpenCV, ResNet, Scikit-Learn, Pandas).
- For Machine Learning / AI projects: Include metrics like classification accuracy %, F1-score, loss reduction, dataset size, image resolution, or inference latency in milliseconds.
- For Web / Data Engineering projects: Include metrics like query optimization %, API latency, throughput, code coverage %, or record count.
- If explicit numbers are not in the raw description, estimate realistic industry-standard technical benchmarks based on the project type and stack (e.g., dataset volume, processing speed, accuracy metrics).

TARGET JOB:
- Title: ${parsedJob.title}
- Company: ${parsedJob.companyName || 'company'}
- Required skills: ${parsedJob.requiredSkills.join(', ')}
- Key responsibilities: ${parsedJob.responsibilities.slice(0, 4).join('; ')}

CANDIDATE DATA:

EXPERIENCE:
${expEntries || '  (none)'}

EDUCATION:
${eduEntries || '  (none)'}

SKILLS:
${skillsList || '(none)'}

CERTIFICATIONS:
${certEntries || '  (none)'}

PROJECTS:
${projectEntries || '  (none)'}

OUTPUT FORMAT — return a JSON array with these sections (include ALL that have data):

[
  {
    "id": "1",
    "type": "skills",
    "title": "Technical Skills",
    "content": {
      "categories": [
        { "name": "Languages", "skills": ["Python", "TypeScript"] },
        { "name": "Frameworks", "skills": ["React", "Node.js"] }
      ]
    }
  },
  {
    "id": "2",
    "type": "experience",
    "title": "Work Experience",
    "content": {
      "items": [
        {
          "title": "Job Title from EXPERIENCE list",
          "company": "Company from EXPERIENCE list",
          "startDate": "from EXPERIENCE list",
          "endDate": "from EXPERIENCE list",
          "bullets": ["Action verb bullet 1", "Action verb bullet 2", "Action verb bullet 3"]
        }
      ]
    }
  },
  {
    "id": "3",
    "type": "projects",
    "title": "Projects",
    "content": {
      "items": [
        {
          "name": "Project name from PROJECTS list",
          "description": "1-2 sentence high-level overview of the project",
          "techStack": ["from PROJECTS list"],
          "impact": "Quantified headline impact (e.g. Achieved 96% accuracy on 20k+ test dataset)",
          "bullets": [
            "Architected [System/Model] using [Framework] and [Language], processing [Dataset Size/Number] with [Performance Metric].",
            "Trained [Specific Model/Algorithm] using [Technique], achieving [Quantified Result %] precision/accuracy across [N] validation batches.",
            "Optimized [Pipeline/Process] by implementing [Feature/Optimization], reducing latency by [X%] and boosting throughput.",
            "Deployed [Application/API] using [Deployment Tool] to enable seamless [Capability] for end users."
          ]
        }
      ]
    }
  },
  {
    "id": "4",
    "type": "education",
    "title": "Education",
    "content": {
      "items": [
        {
          "institution": "from EDUCATION list",
          "degree": "from EDUCATION list",
          "field": "from EDUCATION list",
          "startDate": "from EDUCATION list",
          "endDate": "from EDUCATION list"
        }
      ]
    }
  },
  {
    "id": "5",
    "type": "certifications",
    "title": "Certifications",
    "content": {
      "items": [
        {
          "name": "from CERTIFICATIONS list",
          "organization": "from CERTIFICATIONS list",
          "date": "from CERTIFICATIONS list",
          "url": "optional url from CERTIFICATIONS list"
        }
      ]
    }
  }
]

IMPORTANT REMINDERS:
- Include the certifications section if there are certifications above.
- Experience bullets MUST be an array of strings, NOT a paragraph.
- Each project MUST have 3-4 detailed bullet points derived from its description and README data.
- Use ONLY the candidate's actual data. Rephrase for ATS optimization but do NOT fabricate.`;
}

export function buildSummaryPrompt(parsedJob: ParsedJob, cvSections: CVSection[]): string {
  const experience = cvSections.find(s => s.type === 'experience');
  const skills = cvSections.find(s => s.type === 'skills');
  return `${JSON_INSTRUCTION}

Write a 100-120 word ATS-optimized professional summary for this CV.
Return JSON: { "summary": "your 100-120 summary text here" }

Job target: ${parsedJob.title} (${parsedJob.seniorityLevel}) at ${parsedJob.companyName || 'company'}
Industry: ${parsedJob.industry}
Key requirements: ${parsedJob.requiredSkills.slice(0, 5).join(', ')}
Experience context: ${(JSON.stringify(experience?.content) || '').substring(0, 500)}
Skills context: ${(JSON.stringify(skills?.content) || '').substring(0, 300)}`;
}

export function buildATSOptimizationPrompt(parsedJob: ParsedJob, cvSections: CVSection[]): string {
  return `${JSON_INSTRUCTION}

You are an expert resume editor and ATS optimization specialist. Your task is to review, polish, fix grammar/spelling, and ATS-optimize all sections of the candidate's CV.

CRITICAL INSTRUCTIONS:
1. FIX all grammar, spelling, typos, and awkward phrasing in every section and bullet point.
2. REPHRASE experience bullets, project descriptions, and summary to sound executive-ready, professional, and impact-driven. Use strong action verbs (e.g., Architected, Engineered, Spearheaded, Accelerated, Delivered, Optimized).
3. ALIGN phrasing and terminology with key skills from the target job posting without inventing false credentials or fake companies.
4. KEEP ALL sections present in the input (summary, skills, experience, projects, education, certifications, custom sections). Do NOT delete any user-added section or item.
5. PRESERVE user data (company names, job titles, institution names, degree names, dates, URLs) intact.
6. Experience bullets MUST remain an array of concise bullet strings.
7. Project bullets MUST remain an array of action-oriented bullet strings under each project item.
8. Return the complete updated JSON array of sections matching the exact input section array structure.

TARGET JOB DETAILS:
- Job Title: ${parsedJob.title}
- Required Skills: ${parsedJob.requiredSkills.join(', ')}
- Preferred Skills: ${parsedJob.preferredSkills.join(', ')}

CV SECTIONS TO POLISH & OPTIMIZE:
${JSON.stringify(cvSections, null, 2)}`;
}

export function buildATSScoringPrompt(parsedJob: ParsedJob, cvSections: CVSection[]): string {
  const existingSkills = cvSections
    .filter(s => s.type === 'skills')
    .flatMap(s => (s.content?.categories || []).flatMap((c: any) => c.skills || []))
    .concat(cvSections.filter(s => s.type === 'skills').flatMap(s => s.content?.skills || []));

  return `${JSON_INSTRUCTION}

Score this candidate's CV against the target job posting (0-100 for overall, keywordMatch, formatCompliance, sectionCompleteness, readability).

CRITICAL ACCURACY RULES:
1. Carefully check the Candidate's Actual Listed Skills: [${existingSkills.join(', ')}]. If skills like PyTorch, TensorFlow, Scikit-Learn, Python, etc. are listed, count them as exact keyword matches! Do NOT claim a skill is missing if it is listed above.
2. In the "details" explanation array, provide precise, truthful explanations based on actual CV content.

TARGET JOB DETAILS:
- Job Title: ${parsedJob.title}
- Required Skills: ${parsedJob.requiredSkills.join(', ')}
- Preferred Skills: ${parsedJob.preferredSkills.join(', ')}

FULL CANDIDATE CV SECTIONS:
${JSON.stringify(cvSections, null, 2)}

Return JSON:
{
  "overall": 85,
  "keywordMatch": 85,
  "formatCompliance": 90,
  "sectionCompleteness": 90,
  "readability": 85,
  "details": [
    { "category": "Keyword Match", "score": 85, "explanation": "Includes core required skills such as Python, PyTorch, and TensorFlow." },
    { "category": "Format Compliance", "score": 90, "explanation": "Well-structured sections with standard ATS layout." },
    { "category": "Section Completeness", "score": 90, "explanation": "All key sections are present." },
    { "category": "Readability", "score": 85, "explanation": "Clear bullet points and professional tone." }
  ]
}`;
}

export function buildRecommendationsPrompt(parsedJob: ParsedJob, _profile: UserProfile, cvSections: CVSection[]): string {
  const existingSkills = cvSections
    .filter(s => s.type === 'skills')
    .flatMap(s => (s.content?.categories || []).flatMap((c: any) => c.skills || []))
    .concat(cvSections.filter(s => s.type === 'skills').flatMap(s => s.content?.skills || []));

  const existingCertifications = cvSections
    .filter(s => s.type === 'certifications')
    .flatMap(s => (s.content?.items || []).map((i: any) => i.name));

  const existingProjects = cvSections
    .filter(s => s.type === 'projects')
    .flatMap(s => (s.content?.items || []).map((i: any) => i.name));

  const existingSections = cvSections.map(s => s.type || s.title);

  return `${JSON_INSTRUCTION}

You are an expert ATS CV Coach. Generate top 4-5 specific, actionable, and ACCURATE recommendations to improve this candidate's CV for the target job.

CRITICAL ACCURACY RULES — DO NOT MAKE FALSE CLAIMS:
1. Existing Skills in CV: [${existingSkills.join(', ')}]
   -> NEVER recommend adding a skill if it is ALREADY listed above!
2. Existing Certifications in CV: [${existingCertifications.join(', ')}]
   -> NEVER recommend adding a Certifications section if it is ALREADY present in the CV!
3. Existing Projects in CV: [${existingProjects.join(', ')}]
   -> NEVER recommend adding Python or ML projects if Python/ML projects are ALREADY present!
4. Existing Sections Present: [${existingSections.join(', ')}]
   -> NEVER recommend adding a section if it ALREADY exists!
5. FOCUS ON REAL IMPROVEMENTS: Focus on adding quantified metrics (percentages, dataset sizes, speed improvements) to bullet points, rephrasing bullets with stronger action verbs, or tailoring project impact statements to job requirements.

TARGET JOB:
- Job Title: ${parsedJob.title}
- Required Skills: ${parsedJob.requiredSkills.join(', ')}
- Preferred Skills: ${parsedJob.preferredSkills.join(', ')}

FULL CV SECTIONS TO EVALUATE:
${JSON.stringify(cvSections, null, 2)}

Return a JSON array of recommendations:
[
  {
    "id": "1",
    "what": "Quantify technical impact in project bullet points",
    "why": "Recruiters and ATS metrics prioritize measurable technical outcomes over generic descriptions",
    "howToFix": "Add concrete figures such as dataset size, latency reduction percentage, or model accuracy metrics to your project bullets",
    "resources": [{ "title": "Quantified Resume Metrics Guide", "url": "https://resumeworded.com/action-verbs-for-resume" }],
    "impact": "high"
  }
]`;
}

export function buildSingleProjectOptimizationPrompt(parsedJob: ParsedJob, project: { name: string; description: string; techStack: string[] }): string {
  return `${JSON_INSTRUCTION}

Convert this raw project into an ATS-optimized CV project entry tailored to the job description.
Return a JSON object:
{
  "name": "Project Name",
  "description": "Short 1-2 sentence description",
  "techStack": ["React", "TypeScript"],
  "impact": "Brief impact statement if applicable",
  "bullets": ["Action verb bullet 1", "Action verb bullet 2"]
}

Rules:
- Use action verbs (built, led, designed, implemented)
- Quantify achievements if possible
- Include keywords from job requirements naturally
- Return 2-4 bullet points

Job: ${parsedJob.title} at ${parsedJob.companyName || 'company'}
Required skills: ${parsedJob.requiredSkills.join(', ')}

Raw Project:
Name: ${project.name}
Tech: ${(project.techStack || []).join(', ')}
Description: ${(project.description || '').substring(0, 1000)}`;
}

export function buildCoverLetterPrompt(
  parsedJob: ParsedJob,
  profile: UserProfile,
  selectedProjects: Project[],
  companyName: string
): string {
  const projectContext = selectedProjects.length > 0
    ? `Relevant projects: ${selectedProjects.map(p => `${p.name}: ${(p.description || '').substring(0, 150)}${p.impact ? ` (Impact: ${p.impact})` : ''}`).join(' | ')}`
    : '';

  return `You are an expert cover letter writer. Write a professional cover letter (3-4 paragraphs, plain text, no markdown).

STRUCTURE:
- Paragraph 1: Opening hook — express genuine interest in the "${parsedJob.title}" role at ${companyName}. Mention what draws you to the company or role specifically.
- Paragraph 2: Map relevant experience and projects directly to the job requirements. Reference specific achievements and quantified results from the candidate's background.
- Paragraph 3: Highlight technical skills and unique value proposition. Connect capabilities to what the team needs.
- Paragraph 4: Brief closing with enthusiasm and a clear call to action.

TONE DETECTION:
- Read the job description below. If it uses casual language ("you'll", "we're a scrappy team", startup jargon), write in a warm, conversational-but-professional tone.
- If it's formal ("the successful candidate shall", corporate language), write in a traditional professional tone.
- Match their energy — never more formal than the JD, never less professional than a cover letter demands.

KEYWORD INTEGRATION:
Weave 2-3 of these keywords naturally into the letter (don't force them): ${parsedJob.requiredSkills.slice(0, 5).join(', ')}

CANDIDATE INFO:
Name: ${profile.personalInfo.fullName}
${profile.personalInfo.email ? `Email: ${profile.personalInfo.email}` : ''}
Experience: ${profile.experience.map(e => `${e.title} at ${e.company} — ${e.bullets.slice(0, 2).join('; ')}`).join(' | ')}
Key skills: ${profile.skills.map(s => s.name).slice(0, 10).join(', ')}
${projectContext}

JOB DESCRIPTION:
${(parsedJob.rawText || '').substring(0, 3000)}

Write ONLY the cover letter body (no "Dear Hiring Manager" or sign-off — the app adds those). Return plain text, no JSON, no markdown.`;
}
