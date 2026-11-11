// Original vector artwork. No external images, icons, fonts, scripts, or CSS.
export const palettes = {
  dark: {bg:'#070f1e', panel:'#0c192b', inset:'#101f34', line:'#233c56', text:'#edf5ff', muted:'#a5b9ce', faint:'#7691ad', cyan:'#61e4ee', blue:'#659fff', grid:'#14283e', glow:'#164d77'},
  light: {bg:'#f1f6fc', panel:'#ffffff', inset:'#e9f1fa', line:'#c1d2e4', text:'#12253e', muted:'#435e7a', faint:'#52708e', cyan:'#007c88', blue:'#285fc2', grid:'#dae6f2', glow:'#c7e6fa'}
};
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const formatDate = value => new Date(value+'T00:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});

export function artwork(data, theme, mobile) {
  const p = palettes[theme];
  const W = mobile ? 480 : 1200;
  const H = mobile ? 3360 : 2040;
  const M = mobile ? 28 : 52;
  const inner = W-M*2;
  const parts = [];
  const add = s => parts.push(s);
  const rect = (x,y,w,h,fill=p.panel,stroke=p.line,r=16) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`);
  const line = (x,y,x2,y2,color=p.line,extra='') => add(`<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" ${extra}/>`);
  const text = (x,y,value,size=22,color=p.text,weight=400,extra='') => add(`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" ${extra}>${escape(value)}</text>`);
  const mono = (x,y,value,size=15,color=p.faint,extra='') => text(x,y,value,size,color,400,`font-family="'IBM Plex Mono',monospace" ${extra}`);
  const lines = (x,y,values,size=22,color=p.muted,step=32) => values.forEach((s,i)=>text(x,y+i*step,s,size,color));
  const circle = (x,y,r,fill,stroke='none',extra='') => add(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`);
  const section = (y,index,title,aside='') => {
    mono(M,y,index,16,p.cyan); text(M+40,y,title,mobile?24:28,p.text,600);
    if (aside && !mobile) mono(W-M,y,aside,14,p.faint,'text-anchor="end"');
  };
  const chip = (x,y,label,w) => {rect(x,y,w,32,p.inset,p.line,7);mono(x+12,y+21,label,13,p.cyan);};

  add(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title description"><title id="title">Vishnu Vinayan — AI Engineer</title><desc id="description">AI engineering profile. GenAI, RAG, AI agents and full-stack engineering. Ask AI at Bamboo Card and independent BizBrain AI. Public GitHub data collected ${escape(data.fetchedAt)}. Full text and chart data are available in the README and data directory.</desc><defs><radialGradient id="halo"><stop stop-color="${p.glow}" stop-opacity=".6"/><stop offset="1" stop-color="${p.bg}" stop-opacity="0"/></radialGradient><linearGradient id="accent" x2="1" y2="1"><stop stop-color="${p.cyan}"/><stop offset="1" stop-color="${p.blue}"/></linearGradient><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="${p.grid}"/></pattern></defs><g font-family="'IBM Plex Sans',Arial,sans-serif">`);
  rect(0,0,W,H,p.bg,p.line,24);
  add(`<rect x="1" y="1" width="${W-2}" height="${mobile?780:580}" rx="24" fill="url(#grid)"/><ellipse cx="${mobile?300:950}" cy="260" rx="${mobile?300:450}" ry="330" fill="url(#halo)"/>`);
  line(M,92,W-M,92);
  rect(M,30,40,40,p.inset,p.line,10);text(M+20,56,'VV',16,p.cyan,700,'text-anchor="middle"');
  mono(M+54,55,'VISHNU / ENGINEERING',mobile?13:15,p.muted);
  if (!mobile) {circle(1006,50,4,p.cyan);mono(1020,55,'DUBAI, UAE',14,p.muted);}
  mono(M,139,'AI ENGINEER',16,p.cyan,'letter-spacing="3"');
  text(M,mobile?198:226,'Vishnu',mobile?62:82,p.text,700,'letter-spacing="-3"');
  text(M,mobile?264:314,'Vinayan',mobile?62:82,p.text,700,'letter-spacing="-3"');
  text(M,mobile?316:369,'Intelligence, engineered.',mobile?28:34,p.cyan,500,'letter-spacing="-.8"');
  lines(M,mobile?354:412,mobile?['GenAI · RAG · AI Agents','Full-Stack Engineering']:['GenAI · RAG · AI Agents · Full-Stack Engineering'],mobile?21:23,p.muted,31);

  // A conceptual neural graph: decorative, never presented as project architecture.
  const nx = mobile?86:772, ny = mobile?430:156, scale = mobile?.84:1;
  add(`<g transform="translate(${nx} ${ny}) scale(${scale})">`);
  circle(180,115,135,'none',p.line,'stroke-dasharray="3 9"');
  circle(180,115,101,'none',p.line);
  const nodes = [[16,68],[30,156],[104,7],[104,91],[110,206],[185,61],[185,157],[260,18],[266,109],[268,209],[343,66],[343,164]];
  const edges = [[0,2],[0,3],[1,3],[1,4],[2,5],[3,5],[3,6],[4,6],[5,7],[5,8],[6,8],[6,9],[7,10],[8,10],[8,11],[9,11],[5,6]];
  for(const [a,b] of edges) line(...nodes[a],...nodes[b],p.blue,'stroke-width="1.2" opacity=".38"');
  add(`<path d="M16 68L104 91L185 61L266 109L343 66" fill="none" stroke="url(#accent)" stroke-width="2.4"/>`);
  nodes.forEach(([x,y],i)=>{circle(x,y,i===5||i===8?11:7,p.bg,i===5||i===8?p.cyan:p.blue,'stroke-width="1.5"');circle(x,y,2.5,i===5||i===8?p.cyan:p.blue);});
  mono(180,278,'CONTEXT → REASONING → ACTION',13,p.faint,'text-anchor="middle"');
  add('</g>');
  const ey = mobile?715:494;
  line(M,ey-30,W-M,ey-30);
  text(M,ey+10,'10+',mobile?38:42,p.text,600);lines(M+(mobile?86:96),ey-6,['YEARS IN SOFTWARE','ENGINEERING'],mobile?12:14,p.muted,19);
  const ex=mobile?264:400;
  text(ex,ey+10,'8+',mobile?38:42,p.text,600);lines(ex+(mobile?60:70),ey-6,['YEARS IN','THE UAE'],mobile?12:14,p.muted,19);
  if(!mobile) mono(1148,ey,'FROM FULL STACK TO AI SYSTEMS',14,p.faint,'text-anchor="end"');

  const fy=mobile?820:600;
  section(fy,'01','Engineering focus', 'CONNECTED SYSTEMS / PRACTICAL AI');
  const focus = [
    {n:'01', title:'Grounded intelligence', body:mobile?['Retrieval-augmented generation','and LLM integrations.']:['Retrieval-augmented generation','and LLM integrations.'], icon:'context'},
    {n:'02', title:'Agentic workflows', body:['Stateful orchestration with','LangGraph and LangChain.'], icon:'agent'},
    {n:'03', title:'End-to-end delivery', body:mobile?['APIs, data layers and interfaces','built with full-stack experience.']:['APIs, data layers and interfaces','built with full-stack experience.'], icon:'stack'}
  ];
  focus.forEach((f,i)=>{
    const x=mobile?M:M+i*372, y=mobile?fy+26+i*146:fy+30, w=mobile?inner:352, h=mobile?132:190;
    rect(x,y,w,h);mono(x+22,y+30,f.n,14,p.cyan);
    if(!mobile) {line(x+300,y+24,x+326,y+24,p.cyan);line(x+313,y+11,x+313,y+37,p.blue);}
    text(x+22,y+(mobile?58:77),f.title,mobile?23:24,p.text,600);
    lines(x+22,y+(mobile?88:114),f.body,mobile?20:19,p.muted,mobile?27:29);
  });
  const flowY=mobile?1299:866;
  const flow=['CONTEXT','RETRIEVE','REASON','ACT'];
  flow.forEach((s,i)=>{
    const x=M+i*(inner/4); mono(x+(inner/4-14)/2,flowY,s,mobile?12:15,p.cyan,'text-anchor="middle"');
    if(i<3) text(x+inner/4-12,flowY,'→',18,p.faint);
  });

  const py=mobile?1370:953;
  section(py,'02','Selected AI work','PRODUCTION + INDEPENDENT');
  const projects=[
    {name:'Ask AI',status:'IN PRODUCTION',sub:'BAMBOO CARD',desc:mobile?['A developer documentation','assistant, deployed in the','Bamboo Card documentation.']:['A production-deployed developer','documentation assistant at Bamboo Card.'],footer:'docs.bamboocardportal.com ↗'},
    {name:'BizBrain AI',status:'IN DEVELOPMENT',sub:'INDEPENDENT PROJECT',desc:mobile?['An agentic business intelligence','platform, independently built','and under active development.']:['An independent agentic business intelligence','platform under active development.'],footer:'Private source · Public overview only'}
  ];
  projects.forEach((v,i)=>{
    const x=mobile?M:M+i*560,y=py+30+(mobile?i*300:0),w=mobile?inner:536,h=mobile?280:280;
    rect(x,y,w,h);add(`<path d="M${x+20} ${y}H${x+w-20}" stroke="url(#accent)" stroke-width="2"/>`);
    mono(x+24,y+35,v.sub,13,p.faint);circle(x+w-26,y+30,4,i===0?p.cyan:p.blue);
    text(x+24,y+84,v.name,mobile?35:38,p.text,600,'letter-spacing="-1"');
    chip(x+24,y+102,v.status,i===0?148:158);
    lines(x+24,y+166,v.desc,mobile?21:21,p.muted,29);
    mono(x+24,y+255,v.footer,mobile?14:16,p.cyan);
  });

  const ty=mobile?2055:1338;
  section(ty,'03','Technology stack','TOOLS FOR THE FULL SYSTEM');
  const stack=[['AI / ORCHESTRATION',mobile?['Python · LangGraph · LangChain','LLM integrations']:['Python · LangGraph · LangChain · LLM integrations']],['BACKEND / DATA',mobile?['FastAPI · Node.js · PostgreSQL','REST APIs']:['FastAPI · Node.js · PostgreSQL · REST APIs']],['INTERFACES',mobile?['React · Next.js · TypeScript']:['React · Next.js · TypeScript']]];
  stack.forEach(([label,values],i)=>{
    const y=ty+42+i*(mobile?104:63);
    mono(M,y,label,13,p.cyan);
    lines(mobile?M:M+270,mobile?y+29:y+2,values,mobile?21:22,p.muted,29);
    line(M,y+(mobile?78:28),W-M,y+(mobile?78:28));
  });

  const ay=mobile?2456:1610;
  section(ay,'04','Public GitHub activity',`SNAPSHOT / ${data.fetchedAt.slice(0,10)}`);
  const counts=[['PUBLIC REPOS',data.account.publicRepositories],['NON-FORK REPOS',data.account.nonForkRepositories],['STARS¹',data.account.starsOnNonForkRepositories],['FOLLOWERS',data.account.followers]];
  counts.forEach(([label,value],i)=>{
    const x=M+(mobile?i%2*inner/2:i*inner/4), row=mobile?Math.floor(i/2)*100:0;
    text(x,ay+(mobile?65:63)+row,value,mobile?38:40,p.text,600);
    mono(x,ay+(mobile?90:88)+row,label,mobile?14:13,p.muted);
  });
  const cy=ay+(mobile?230:118), chartX=mobile?M:610, chartW=mobile?inner:538;
  // Language bars encode repository counts, not code share or skill level.
  text(M,cy+10,'Primary repository languages',mobile?21:20,p.text,600);
  mono(M,cy+34,'NON-FORK REPOSITORIES · COUNT',mobile?11:12,p.faint);
  const chartLanguages=data.languages.length<=4?data.languages:[...data.languages.slice(0,3),{name:'Other',repositories:data.languages.slice(3).reduce((n,l)=>n+l.repositories,0)}];
  chartLanguages.forEach((l,i)=>{
    const y=cy+66+i*29, bw=mobile?210:210, bx=M+(mobile?140:150);
    text(M,y,l.name,16,p.muted);
    rect(bx,y-11,bw,7,p.inset,'none',3);
    if(l.repositories) rect(bx,y-11,bw*l.repositories/Math.max(1,data.account.nonForkRepositories),7,i%2?p.blue:p.cyan,'none',3);
    mono(bx+bw+20,y,l.repositories,14,p.text);
  });
  const chartY=mobile?cy+225:cy;
  text(chartX,chartY+10,`${data.activity.total} observed public events`,mobile?21:20,p.text,600);
  mono(chartX,chartY+34,'30 UTC DAYS · NOT A CONTRIBUTION TOTAL',mobile?11:12,p.faint);
  const baseline=chartY+142, max=Math.max(1,...data.activity.daily.map(d=>d.count));
  line(chartX,baseline,chartX+chartW,baseline);
  mono(chartX+chartW,chartY+55,`${max} / day`,11,p.faint,'text-anchor="end"');
  data.activity.daily.forEach((d,i)=>{
    const step=chartW/30, height=76*d.count/max;
    if(d.count) rect(chartX+i*step,baseline-height,step-4,height,p.blue,'none',2);
    else circle(chartX+i*step+(step-4)/2,baseline-1,1,p.faint);
  });
  mono(chartX,baseline+23,formatDate(data.activity.startDate),12,p.faint);
  mono(chartX+chartW,baseline+23,formatDate(data.activity.endDate),12,p.faint,'text-anchor="end"');
  const footY=mobile?3177:1920;
  mono(M,footY,'¹ Stars on owned, public non-fork repositories.',mobile?11:13,p.faint);
  mono(M,footY+22,data.activity.capped?'Events: 300-record cap reached; partial activity.':mobile?'Events: GitHub’s limited recent public feed.':'Events: GitHub’s limited recent public feed; up to 300 records. No private activity.',mobile?11:13,p.faint);
  line(M,footY+42,W-M,footY+42);
  mono(M,footY+72,mobile?`SNAPSHOT / ${data.fetchedAt.slice(0,10)}`:'VISHNU VINAYAN / AI + FULL-STACK ENGINEERING',mobile?12:13,p.muted);
  if(mobile) mono(M,footY+100,'PORTFOLIO · LINKEDIN · GITHUB ↗',12,p.cyan);
  else mono(W-M,footY+72,'PORTFOLIO · LINKEDIN · GITHUB ↗',13,p.cyan,'text-anchor="end"');
  add('</g></svg>');
  return parts.join('\n')+'\n';
}
