import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validateSnapshot} from './stats.mjs';
import {marked} from 'marked';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFile(resolve(root,p),'utf8');
const data=validateSnapshot(JSON.parse(await read('data/github-public.json')));
const readme=await read('README.md');
const html=marked.parse(readme,{gfm:true});
assert.equal((html.match(/<picture>/g)??[]).length,2);
assert.equal((html.match(/<table>/g)??[]).length,3);
for(const match of html.matchAll(/(?:src|srcset|href)="(\.\/[^"]+)"/g)) {
  const path=match[1].split('#')[0];
  assert.ok((await stat(resolve(root,path))).isFile(),`Missing ${path}`);
}
for(const theme of ['dark','light']) for(const layout of ['desktop','mobile']) {
  const base=`assets/profile-${theme}-${layout}`;
  const svg=await read(`${base}.svg`);
  assert.ok(svg.includes('<title id="title">'));
  assert.ok(svg.includes('role="img"'));
  assert.doesNotMatch(svg,/<script|<foreignObject|<image|@import|url\(https?:/i);
  const png=await readFile(resolve(root,`${base}.png`));
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),layout==='mobile'?960:2400);
  assert.equal(png.readUInt32BE(20),layout==='mobile'?6720:4080);
  assert.ok(png.length>10_000 && png.length<3_000_000,'Unexpected PNG size');
}
const totals=(await read('data/activity.csv')).trim().split('\n').slice(1).reduce((n,line)=>n+Number(line.split(',')[1]),0);
assert.equal(totals,data.activity.total);
assert.doesNotMatch(readme,/github\.com\/[^\s"<>)]*(?:bizbrain|bamboo)/i);
assert.doesNotMatch(await read('data/github-public.json'),/"(?:repo|payload|email|token|full_name)"\s*:/i);
// Scan publishable text, excluding dependencies and local-only previews.
async function scan(dir='') {
  for(const entry of await readdir(resolve(root,dir),{withFileTypes:true})) {
    if(['node_modules','.preview','.git'].includes(entry.name))continue;
    const p=dir?`${dir}/${entry.name}`:entry.name;
    if(entry.isDirectory()) await scan(p);
    else if(/\.(md|json|mjs|yml|svg)$/.test(entry.name)) {
      const content=await read(p);
      assert.doesNotMatch(content,/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,`Potential credential in ${p}`);
    }
  }
}
await scan();
console.log('Validated Markdown, local image/link paths, image dimensions, snapshot totals, chart CSV, disclosure boundaries and credential patterns.');
