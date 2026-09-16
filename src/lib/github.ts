export async function fetchGitHubRepos(token: string) {
  const allRepos = [];
  // Fetch all repositories (public and private) owned by the user or where they are a collaborator
  let url = 'https://api.github.com/user/repos?type=all&per_page=100&sort=updated';

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    allRepos.push(...data);

    // Pagination: parse Link header
    const linkHeader = response.headers.get('link');
    if (linkHeader) {
      const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = match ? match[1] : '';
    } else {
      url = '';
    }
  }

  return allRepos;
}

export async function fetchRepoLanguages(token: string, languagesUrl: string) {
  const response = await fetch(languagesUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  });

  if (!response.ok) return [];

  const data = await response.json();
  return Object.keys(data);
}
