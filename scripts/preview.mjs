import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from 'marked';

const root=fileURLToPath(new URL('../',import.meta.url));
const css=`*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}body[data-theme=dark]{--bg:#0d1117;--fg:#e6edf3;--border:#30363d;--link:#79c0ff;--surface:#161b22}body[data-theme=light]{--bg:#fff;--fg:#1f2328;--border:#d1d9e0;--link:#0969da;--surface:#f6f8fa}header{padding:18px 24px;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:center;flex-wrap:wrap;font-size:14px}header span{margin-right:auto;color:var(--fg)}button{background:var(--surface);color:var(--fg);border:1px solid var(--border);border-radius:6px;padding:6px 12px;cursor:pointer}main{max-width:1012px;margin:32px auto;padding:32px;border:1px solid var(--border);border-radius:6px}img{max-width:100%;height:auto;display:block}picture{display:block}a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}p{margin:0 0 16px}main>a:has(picture){display:block;margin-bottom:20px}h1,h2{border-bottom:1px solid var(--border);padding-bottom:8px}summary{cursor:pointer;padding:8px 0}table{border-collapse:collapse;max-width:100%;display:block;overflow:auto}td,th{border:1px solid var(--border);padding:6px 13px}tr:nth-child(even){background:var(--surface)}pre{overflow:auto;background:var(--surface);padding:16px;border-radius:6px}code{font-size:85%}body[data-theme=light] a[href$="#gh-dark-mode-only"],body[data-theme=dark] a[href$="#gh-light-mode-only"]{display:none}@media(max-width:600px){header{padding:12px;font-size:12px}main{border:0;margin:0 auto;padding:12px}body{font-size:14px}td,th{padding:5px 8px}}`;

export function createPreviewServer() {
  return http.createServer(async(req,res)=>{
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
      const file=resolve(root,'.'+(pathname==='/'?'/README.md':pathname));
      if(!file.startsWith(root.endsWith(sep)?root:root+sep) || /(?:^|\/)\./.test(pathname) || pathname.includes('node_modules')) {res.writeHead(403);res.end();return;}
      if(!(await stat(file)).isFile()){res.writeHead(404);res.end();return;}
      const body=await readFile(file);
      const ext=extname(file);
      if(ext==='.md') {
        const rendered=marked.parse(body.toString(),{gfm:true});
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vishnu Vinayan · Profile preview</title><style>${css}</style><body data-theme="dark"><header><span>LOCAL PREVIEW / GitHub-style README</span><button data-theme="dark">Dark</button><button data-theme="light">Light</button><button id="text">Toggle text</button></header><main>${rendered}</main><script>const chosen=new URLSearchParams(location.search).get('theme');if(chosen==='light')document.body.dataset.theme='light';document.querySelectorAll('button[data-theme]').forEach(b=>b.onclick=()=>document.body.dataset.theme=b.dataset.theme);document.querySelector('#text').onclick=()=>document.querySelectorAll('details').forEach(d=>d.open=!d.open);</script></body></html>`);
      } else {
        res.writeHead(200,{'Content-Type':({'.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.csv':'text/csv','.ttf':'font/ttf'})[ext]??'text/plain','Cache-Control':'no-store'});res.end(body);
      }
    }catch{res.writeHead(404);res.end('Not found');}
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT??4173);
  createPreviewServer().listen(port,'127.0.0.1',()=>console.log(`Local-only preview: http://127.0.0.1:${port} (Ctrl+C to stop)`));
}
