import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.pdf':'application/pdf','.txt':'text/plain'};
const port=Number(process.env.PORT||8792);
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}const base=(process.env.BASE_PATH||'').replace(/\/$/,'');if(base&&pathname.startsWith(base+'/'))pathname=pathname.slice(base.length);let f=path.resolve(root,'.'+pathname);if(!f.startsWith(root+path.sep)&&f!==root){res.writeHead(403);res.end();return;}if(fs.existsSync(f)&&fs.statSync(f).isDirectory()){if(!pathname.endsWith('/')){res.writeHead(301,{Location:req.url.replace(/\?.*$/,'')+'/'+new URL(req.url,'http://localhost').search});res.end();return;}f=path.join(f,'index.html');}if(!fs.existsSync(f)){res.statusCode=404;f=path.join(root,'404.html');}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');fs.createReadStream(f).pipe(res);}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}`));
