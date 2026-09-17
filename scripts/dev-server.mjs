import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import health from '../api/health.js';
import stream from '../api/stream.js';
import authLogin from '../api/auth/login.js';
import authCallback from '../api/auth/callback.js';
import authStatus from '../api/auth/status.js';
import authLogout from '../api/auth/logout.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4311);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host}`);
  req.query=Object.fromEntries(url.searchParams.entries());
  res.status=function(c){this.statusCode=c;return this};
  res.json=function(v){this.setHeader('Content-Type','application/json');this.end(JSON.stringify(v));return this};
  if(url.pathname==='/api/health') return health(req,res);
  if(url.pathname==='/api/stream') return stream(req,res);
  if(url.pathname==='/api/auth/login') return authLogin(req,res);
  if(url.pathname==='/api/auth/callback') return authCallback(req,res);
  if(url.pathname==='/api/auth/status') return authStatus(req,res);
  if(url.pathname==='/api/auth/logout') return authLogout(req,res);
  const rel=url.pathname==='/'?'index.html':url.pathname.replace(/^\//,'');
  const file=path.join(root,rel);
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.statusCode=404;res.end('not found');return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
server.listen(port,()=>console.log(`DEV_SERVER http://127.0.0.1:${port}`));
