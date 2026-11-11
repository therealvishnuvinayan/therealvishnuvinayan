import {writeFile, rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {aggregate, validateSnapshot, USER} from './stats.mjs';

// Intentionally unauthenticated: never read tokens, /user/repos, GraphQL,
// repository contents, event payloads, or organization/private endpoints.
const base = `https://api.github.com/users/${USER}`;
async function get(url) {
  const response = await fetch(url, {
    headers: {'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':`${USER}-public-profile`},
    signal: AbortSignal.timeout(30_000), redirect: 'error'
  });
  if (!response.ok) throw new Error(`Public GitHub API returned HTTP ${response.status}; existing snapshot retained`);
  return {data: await response.json(), date: response.headers.get('date'), link: response.headers.get('link') ?? ''};
}
async function pages(path, maxPages) {
  const rows = [];
  for (let page = 1; page <= maxPages; page++) {
    const response = await get(`${base}/${path}&page=${page}`);
    if (!Array.isArray(response.data)) throw new Error('Unexpected paginated response');
    rows.push(...response.data);
    if (!response.link.includes('rel="next"')) return rows;
    if (page === maxPages && !path.startsWith('events/public')) throw new Error('Repository pagination incomplete');
  }
  return rows;
}
try {
  const profile = await get(base);
  const repositories = await pages('repos?type=owner&sort=full_name&per_page=100', 100);
  const events = await pages('events/public?per_page=100', 3);
  const fetchedAt = new Date().toISOString();
  // Catch a badly configured host clock rather than silently mislabel the data.
  if (!profile.date || Math.abs(Date.parse(profile.date)-Date.parse(fetchedAt)) > 300_000) throw new Error('Host clock differs from GitHub; correct it before refreshing');
  const snapshot = validateSnapshot(aggregate(profile.data, repositories, events, fetchedAt));
  const target = fileURLToPath(new URL('../data/github-public.json', import.meta.url));
  await writeFile(`${target}.tmp`, JSON.stringify(snapshot, null, 2)+'\n');
  await rename(`${target}.tmp`, target);
  console.log(`Collected public metadata: ${snapshot.account.publicRepositories} repositories, ${snapshot.activity.total} observed events. No repository names or event payloads saved.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
