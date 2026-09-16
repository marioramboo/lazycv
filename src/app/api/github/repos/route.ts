import { NextResponse } from 'next/server';
import { fetchGitHubRepos, fetchRepoLanguages } from '@/lib/github';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const rawRepos = await fetchGitHubRepos(token);

    // Fetch languages for each repo. To avoid rate limits/slow responses, we limit to top 30 repos or run concurrently.
    // For ponytail simplicity, we'll fetch languages for the first 20 recently updated repos.
    const recentRepos = rawRepos.slice(0, 30);
    
    const reposWithLanguages = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentRepos.map(async (repo: any) => {
        let techStack: string[] = [];
        if (repo.language) {
          techStack.push(repo.language);
        }
        
        try {
          if (repo.languages_url) {
            const langs = await fetchRepoLanguages(token, repo.languages_url);
            // merge and dedupe
            techStack = Array.from(new Set([...techStack, ...langs]));
          }
        } catch {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          console.warn('Failed to fetch languages for', repo.name);
        }

        let readme = '';
        try {
          const rUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`;
          const rRes = await fetch(rUrl, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.raw' }
          });
          if (rRes.ok) readme = await rRes.text();
        } catch {}

        let description = repo.description || '';
        // Ponytail: if description is empty or we want extra context, try to pull first real paragraph from readme
        if (!description && readme) {
          const match = readme.split('\n').find(line => line.trim().length > 20 && !line.startsWith('#') && !line.startsWith('<') && !line.startsWith('['));
          if (match) description = match.trim().substring(0, 250);
        }

        return {
          id: repo.id.toString(),
          name: repo.name,
          description,
          originalDescription: repo.description || '',
          readme,
          techStack,
          source: 'github',
          pinned: false,
          hidden: false,
          githubUrl: repo.html_url,
          topics: repo.topics || [],
          primaryLanguage: repo.language,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
        };
      })
    );

    return NextResponse.json({ repos: reposWithLanguages });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('GitHub API route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch repositories' }, { status: 500 });
  }
}
