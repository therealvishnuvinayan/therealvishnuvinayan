import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregate,validateSnapshot,USER} from '../scripts/stats.mjs';
const profile={login:USER,public_repos:2,followers:0,created_at:'2022-05-12T12:52:30Z'};
const repo=(id,extra={})=>({id,private:false,visibility:'public',owner:{login:USER},fork:false,language:'Python',stargazers_count:2,...extra});
const event=(id,extra={})=>({id,public:true,actor:{login:USER},type:'PushEvent',created_at:'2026-11-10T14:00:00Z',...extra});
const at='2026-11-11T19:00:00Z';

test('excludes private and foreign repos, excludes fork stars and languages',()=>{
  const d=aggregate(profile,[repo(1),repo(2,{fork:true,stargazers_count:999}),repo(3,{private:true,visibility:'private',name:'must-not-be-saved'}),repo(4,{owner:{login:'someone-else'}})],[],at);
  assert.equal(d.account.publicRepositories,2);
  assert.equal(d.account.nonForkRepositories,1);
  assert.equal(d.account.starsOnNonForkRepositories,2);
  assert.deepEqual(d.languages,[{name:'Python',repositories:1}]);
  assert.doesNotMatch(JSON.stringify(d),/must-not-be-saved|someone-else/);
});
test('rejects incomplete repository pagination instead of publishing partial totals',()=>{
  assert.throws(()=>aggregate(profile,[repo(1)],[],at),/pagination/);
});
test('deduplicates events and ignores private, foreign, future and old activity',()=>{
  const d=aggregate(profile,[repo(1),repo(2)],[event('1'),event('1'),event('2',{public:false}),event('3',{actor:{login:'another'}}),event('4',{created_at:'2026-10-12T23:59:59Z'}),event('5',{created_at:'2026-11-12T00:00:00Z'}),event('6',{created_at:'2026-10-13T00:00:00Z'}),event('7',{created_at:at,type:'PullRequestEvent',payload:{secret:'never-saved'},repo:{name:'never-saved'}})],at);
  assert.equal(d.activity.total,3);
  assert.equal(d.activity.daily[0].count,1);
  assert.equal(d.activity.daily.at(-1).count,1);
  assert.deepEqual(d.activity.types,{PullRequestEvent:1,PushEvent:2});
  assert.doesNotMatch(JSON.stringify(d),/never-saved|payload/);
  validateSnapshot(d);
});
test('represents empty activity and unknown languages honestly',()=>{
  const d=aggregate(profile,[repo(1,{language:null}),repo(2,{language:null})],[],at);
  assert.equal(d.activity.total,0);
  assert.ok(d.activity.daily.every(d=>d.count===0));
  assert.deepEqual(d.languages,[{name:'Unspecified',repositories:2}]);
});
test('identifies capped feeds and rejects inconsistent data',()=>{
  const d=aggregate(profile,[repo(1),repo(2)],Array.from({length:300},(_,i)=>event(String(i))),at);
  assert.equal(d.activity.capped,true);
  d.activity.total++;
  assert.throws(()=>validateSnapshot(d),/totals/);
});
