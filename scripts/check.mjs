import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const jsFiles=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name); if(ent.isDirectory()){if(ent.name!=='node_modules')walk(p);} else if(p.endsWith('.js')||p.endsWith('.mjs'))jsFiles.push(p);}}
walk(root);
for(const file of jsFiles){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'}); if(r.status!==0){console.error(r.stderr); process.exit(r.status??1);}}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const ref of ['/assets/styles.css','/assets/app.js']){if(!html.includes(ref)) throw new Error(`index.html missing ${ref}`);}
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
for(const id of ['connectionBadge','modeLabel','symbolLabel','bid','ask','spread','stage','logs','chart','healthText','authText','ctraderConnect','ctraderDisconnect']){if(!html.includes(`id="${id}"`)) throw new Error(`DOM id missing: ${id}`); if(!app.includes(`#${id}`)&&!['chart'].includes(id)) throw new Error(`app.js reference missing: ${id}`);}
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')); if(vercel.functions?.['api/stream.js']?.maxDuration!==300) throw new Error('stream maxDuration must be 300');
for(const route of ['api/auth/login.js','api/auth/callback.js','api/auth/status.js','api/auth/logout.js']) if(!fs.existsSync(path.join(root,route))) throw new Error(`OAuth route missing: ${route}`);
console.log(`CHECK OK — ${jsFiles.length} fichiers JS analysés, HTML, OAuth routes et vercel.json cohérents.`);
