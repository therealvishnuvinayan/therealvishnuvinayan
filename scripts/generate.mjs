import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Resvg} from '@resvg/resvg-js';
import {artwork} from './artwork.mjs';
import {validateSnapshot} from './stats.mjs';

const root = new URL('../', import.meta.url);
const data = validateSnapshot(JSON.parse(await readFile(new URL('data/github-public.json',root),'utf8')));
await mkdir(new URL('assets/',root),{recursive:true});
for(const theme of ['dark','light']) for(const layout of ['desktop','mobile']) {
  const svg = artwork(data,theme,layout==='mobile');
  const name = `assets/profile-${theme}-${layout}`;
  const renderer = new Resvg(svg, {fitTo:{mode:'zoom',value:2},font:{loadSystemFonts:false,fontFiles:[
    fileURLToPath(new URL('assets/fonts/IBMPlexSans-Regular.ttf',root)),
    fileURLToPath(new URL('assets/fonts/IBMPlexSans-SemiBold.ttf',root)),
    fileURLToPath(new URL('assets/fonts/IBMPlexSans-Bold.ttf',root)),
    fileURLToPath(new URL('assets/fonts/IBMPlexMono-Regular.ttf',root))
  ],defaultFontFamily:'IBM Plex Sans'}});
  // Convert glyphs to vector paths so the exported SVG matches the PNG on
  // GitHub and offline, regardless of which fonts the viewer has installed.
  const accessible = svg.match(/<title[^>]*>.*?<\/title><desc[^>]*>.*?<\/desc>/s)[0];
  const outlined = renderer.toString().replace('<svg ', '<svg role="img" aria-labelledby="title description" ').replace(/(<svg[^>]*>)/,`$1${accessible}`);
  await writeFile(new URL(`${name}.svg`,root),outlined);
  await writeFile(new URL(`${name}.png`,root),renderer.render().asPng());
}

const a=data.account, activity=data.activity;
const picture = theme => `<a href="./assets/profile-${theme}-desktop.png#gh-${theme}-mode-only">
<picture>
  <source media="(max-width: 900px)" srcset="./assets/profile-${theme}-mobile.png" />
  <img src="./assets/profile-${theme}-desktop.png" width="100%" alt="Vishnu Vinayan — AI Engineer in Dubai. GenAI, RAG, AI agents and full-stack engineering. 10+ years in software, 8+ in the UAE. Featured: Ask AI at Bamboo Card and independent BizBrain AI. Public GitHub snapshot: ${a.publicRepositories} public repositories, ${a.nonForkRepositories} non-forks, ${a.starsOnNonForkRepositories} stars on non-forks, ${a.followers} follower${a.followers===1?'':'s'}; ${activity.total} observed public events in the displayed 30-day window. Full profile and chart data follow below." />
</picture>
</a>`;
const readme = `${picture('dark')}

${picture('light')}

**Vishnu Vinayan — AI Engineer | GenAI, RAG & AI Agents | Full-Stack Engineering**

10+ years of software engineering experience, including 8+ years in the UAE.

[Portfolio](https://www.vishnuvinayan.com/) · [LinkedIn](https://www.linkedin.com/in/vishnuvinayan/) · [GitHub](https://github.com/therealvishnuvinayan) · [Ask AI ↗](https://docs.bamboocardportal.com/)

<details>
<summary>Read the profile, projects & public statistics as text</summary>

## AI engineering focus

- **Grounded intelligence:** retrieval-augmented generation and LLM integrations.
- **Agentic workflows:** stateful orchestration with LangGraph and LangChain.
- **End-to-end delivery:** APIs, data layers and interfaces built with full-stack experience.

## Selected work

**[Ask AI — Bamboo Card](https://docs.bamboocardportal.com/)**  
A production-deployed developer documentation assistant at Bamboo Card. Use the **Ask AI** entry point on the public documentation site.

**BizBrain AI — Independent project**  
An independent agentic business intelligence platform under active development. Its source repository is private.

## Technology stack

- **AI and orchestration:** Python, LangGraph, LangChain, LLM integrations.
- **Backend and data:** FastAPI, Node.js, PostgreSQL, REST APIs.
- **Interfaces:** React, Next.js, TypeScript.

## Public GitHub snapshot

Collected **${data.fetchedAt}** from GitHub's unauthenticated public REST API.

| Metric | Value | Scope |
| :--- | ---: | :--- |
| Public repositories | ${a.publicRepositories} | Owned by this account; includes forks |
| Non-fork repositories | ${a.nonForkRepositories} | Owned public repositories, excluding forks |
| Repository stars | ${a.starsOnNonForkRepositories} | Sum across owned public non-fork repositories |
| Followers | ${a.followers} | Public account count |
| Observed public events | ${activity.total} | ${activity.startDate} through ${activity.endDate}, UTC; limited recent feed |

Primary language per owned public non-fork repository:

| Language | Repositories |
| :--- | ---: |
${data.languages.map(l=>`| ${l.name.replaceAll('|','\\|')} | ${l.repositories} |`).join('\n')}

Observed event types (an event is **not** a commit or a contribution):

| Event type | Observed events |
| :--- | ---: |
${Object.entries(activity.types).map(([type,count])=>`| ${type} | ${count} |`).join('\n') || '| No events returned | 0 |'}

[Daily chart values](./data/activity.csv) · [Public-data snapshot](./data/github-public.json) · [Sources & methodology](./docs/METHODOLOGY.md)

</details>

<sub>Original generated artwork · Public data only · Snapshot ${data.fetchedAt.slice(0,10)} · <a href="./docs/METHODOLOGY.md">Methodology</a></sub>
`;
await writeFile(new URL('README.md',root),readme);
await writeFile(new URL('data/activity.csv',root),'date_utc,observed_public_events\n'+activity.daily.map(d=>`${d.date},${d.count}`).join('\n')+'\n');
console.log('Generated 4 SVGs, 4 high-resolution PNGs, README and accessible chart data.');
