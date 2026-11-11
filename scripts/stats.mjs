export const USER = 'therealvishnuvinayan';
const DAY = 86_400_000;
const integer = n => Number.isSafeInteger(n) && n >= 0;

export function aggregate(profile, repositories, events, fetchedAt) {
  if (profile.login?.toLowerCase() !== USER || !integer(profile.followers) || !integer(profile.public_repos)) {
    throw new Error('Unexpected public user response');
  }
  const publicRepos = repositories.filter(r => r.private === false && r.visibility === 'public' && r.owner?.login?.toLowerCase() === USER);
  const unique = new Map(publicRepos.map(r => [r.id, r]));
  if (unique.size !== profile.public_repos) throw new Error('Repository pagination or public count changed; retry the collection');
  const originals = [...unique.values()].filter(r => r.fork === false);
  if (originals.some(r => !integer(r.stargazers_count))) throw new Error('Invalid star count');
  const languages = new Map();
  for (const r of originals) {
    const language = r.language ?? 'Unspecified';
    if (typeof language !== 'string' || language.length > 60) throw new Error('Invalid language');
    languages.set(language, (languages.get(language) ?? 0) + 1);
  }
  const end = Date.parse(fetchedAt.slice(0, 10) + 'T00:00:00Z');
  if (!Number.isFinite(end)) throw new Error('Invalid collection date');
  const start = end - 29 * DAY;
  const daily = Array.from({length: 30}, (_, i) => ({date: new Date(start + i * DAY).toISOString().slice(0, 10), count: 0}));
  const types = new Map();
  const seen = new Set();
  for (const e of events) {
    if (e.public !== true || e.actor?.login?.toLowerCase() !== USER || seen.has(e.id)) continue;
    seen.add(e.id);
    const stamp = Date.parse(e.created_at);
    if (!Number.isFinite(stamp) || stamp < start || stamp > Date.parse(fetchedAt)) continue;
    const index = Math.floor((stamp - start) / DAY);
    if (index < 0 || index >= daily.length) continue;
    if (typeof e.type !== 'string' || !/^[A-Za-z]+Event$/.test(e.type)) throw new Error('Invalid event type');
    daily[index].count++;
    types.set(e.type, (types.get(e.type) ?? 0) + 1);
  }
  return {
    schemaVersion: 1,
    username: USER,
    fetchedAt,
    sources: {
      user: `https://api.github.com/users/${USER}`,
      repositories: `https://api.github.com/users/${USER}/repos?type=owner&sort=full_name&per_page=100`,
      events: `https://api.github.com/users/${USER}/events/public?per_page=100`
    },
    account: {publicRepositories: unique.size, nonForkRepositories: originals.length, starsOnNonForkRepositories: originals.reduce((sum, r) => sum + r.stargazers_count, 0), followers: profile.followers, createdAt: profile.created_at},
    languages: [...languages].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, repositories]) => ({name, repositories})),
    activity: {startDate: daily[0].date, endDate: daily.at(-1).date, total: daily.reduce((n,d) => n+d.count, 0), sourceEventsReturned: events.length, capped: events.length >= 300, daily, types: Object.fromEntries([...types].sort())}
  };
}

export function validateSnapshot(data) {
  if (data.schemaVersion !== 1 || data.username !== USER) throw new Error('Snapshot identity mismatch');
  if (!Number.isFinite(Date.parse(data.fetchedAt))) throw new Error('Snapshot date invalid');
  for (const key of ['publicRepositories','nonForkRepositories','starsOnNonForkRepositories','followers']) {
    if (!integer(data.account[key])) throw new Error(`Invalid ${key}`);
  }
  if (data.account.nonForkRepositories > data.account.publicRepositories) throw new Error('Invalid repository totals');
  if (!data.languages.every(l => typeof l.name === 'string' && integer(l.repositories))) throw new Error('Invalid languages');
  if (data.languages.reduce((n,l) => n + l.repositories, 0) !== data.account.nonForkRepositories) throw new Error('Language denominator mismatch');
  const a = data.activity;
  if (!integer(a.total) || a.daily.length !== 30 || a.daily.some(d => !integer(d.count))) throw new Error('Invalid event bins');
  if (a.daily.reduce((n,d) => n + d.count, 0) !== a.total || Object.values(a.types).reduce((n,v) => n+v,0) !== a.total) throw new Error('Event totals mismatch');
  if (a.startDate !== a.daily[0].date || a.endDate !== a.daily.at(-1).date) throw new Error('Event period mismatch');
  for (let i=1;i<a.daily.length;i++) if (Date.parse(a.daily[i].date)-Date.parse(a.daily[i-1].date)!==DAY) throw new Error('Nonconsecutive days');
  return data;
}
