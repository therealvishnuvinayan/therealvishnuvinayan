import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createPreviewServer} from './preview.mjs';
import {artwork} from './artwork.mjs';
const root=new URL('../',import.meta.url);
const output=new URL('.preview/',root);
await mkdir(output,{recursive:true});
const server=createPreviewServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
const report=[];
try {
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  for(const width of [320,375,600,768,900,901,1440]) for(const theme of ['dark','light']) {
    const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
    const failures=[];
    page.on('pageerror',e=>failures.push(e.message));
    page.on('response',r=>{if(r.status()>=400) failures.push(`${r.status()} ${r.url()}`);});
    await page.goto(`${origin}/?theme=${theme}`);
    await page.locator('img:visible').evaluate(img=>img.decode());
    assert.equal(await page.locator('picture:visible').count(),1,'Exactly one theme must display');
    const img=await page.locator('img:visible').evaluate(i=>({src:i.currentSrc,width:i.naturalWidth}));
    assert.ok(img.src.includes(`profile-${theme}-${width<=900?'mobile':'desktop'}.png`));
    assert.ok(img.width>0);
    const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(await overflow(),false,`Overflow at ${width}/${theme}`);
    await page.screenshot({path:fileURLToPath(new URL(`${theme}-${width}.png`,output)),fullPage:true});
    await page.locator('summary').click();
    assert.equal(await page.locator('details').getAttribute('open'),'');
    assert.equal(await page.locator('table').count(),3);
    assert.equal(await overflow(),false,'Text/table overflow');
    assert.deepEqual(failures,[]);
    report.push({width,theme,image:img.src.split('/').at(-1),result:'pass'});
    await page.close();
  }
  // Inspect text before outlining: canvas edge clipping and text collisions.
  const data=JSON.parse(await readFile(new URL('data/github-public.json',root),'utf8'));
  for(const mobile of [false,true]) {
    const page=await browser.newPage();
    await page.goto(origin);
    await page.setContent(`<style>@font-face{font-family:'IBM Plex Sans';src:url('${origin}/assets/fonts/IBMPlexSans-Regular.ttf');font-weight:400}@font-face{font-family:'IBM Plex Sans';src:url('${origin}/assets/fonts/IBMPlexSans-SemiBold.ttf');font-weight:500 600}@font-face{font-family:'IBM Plex Sans';src:url('${origin}/assets/fonts/IBMPlexSans-Bold.ttf');font-weight:700}@font-face{font-family:'IBM Plex Mono';src:url('${origin}/assets/fonts/IBMPlexMono-Regular.ttf')}</style>${artwork(data,'dark',mobile)}`);
    await page.evaluate(()=>document.fonts.ready);
    const problems=await page.evaluate(()=>{
      const svg=document.querySelector('svg'),bound=svg.getBoundingClientRect();
      const context=document.createElement('canvas').getContext('2d');
      const texts=[...svg.querySelectorAll('text')].map(t=>{
        const style=getComputedStyle(t);
        context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        context.letterSpacing=style.letterSpacing==='normal'?'0px':style.letterSpacing;
        const ink=context.measureText(t.textContent);
        let x=Number(t.getAttribute('x'));
        const y=Number(t.getAttribute('y'));
        if(style.textAnchor==='middle')x-=ink.width/2;
        if(style.textAnchor==='end')x-=ink.width;
        const matrix=t.getScreenCTM();
        const topLeft=new DOMPoint(x-ink.actualBoundingBoxLeft,y-ink.actualBoundingBoxAscent).matrixTransform(matrix);
        const bottomRight=new DOMPoint(x+ink.actualBoundingBoxRight,y+ink.actualBoundingBoxDescent).matrixTransform(matrix);
        return {value:t.textContent,b:{left:topLeft.x,right:bottomRight.x,top:topLeft.y,bottom:bottomRight.y}};
      });
      const issues=[];
      for(let i=0;i<texts.length;i++){
        const {b,value}=texts[i];
        if(b.left<bound.left||b.right>bound.right||b.top<bound.top||b.bottom>bound.bottom) issues.push(`Clipped: ${value}`);
        for(let j=i+1;j<texts.length;j++){
          const c=texts[j].b;
          if(Math.min(b.right,c.right)-Math.max(b.left,c.left)>1 && Math.min(b.bottom,c.bottom)-Math.max(b.top,c.top)>1) issues.push(`Overlap: ${value} / ${texts[j].value}`);
        }
      }
      return issues;
    });
    assert.deepEqual(problems,[],`SVG text layout (${mobile?'mobile':'desktop'})`);
    await page.close();
  }
  await writeFile(new URL('validation.json',output),JSON.stringify(report,null,2)+'\n');
  console.log(`Passed ${report.length} responsive/theme checks, expanded text, Markdown tables, image loading and SVG text bounds. Screenshots: .preview/`);
} finally {await browser?.close();server.close();}
