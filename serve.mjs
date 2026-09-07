import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.md':'text/plain; charset=utf-8','.jpeg':'image/jpeg','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(path==='/'?'/index.html':path));
    if(!file.startsWith(root)||!types[extname(file)]||file.includes(`${sep}test${sep}`)){res.writeHead(404);res.end();return;}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)],'X-Content-Type-Options':'nosniff'});res.end(data);
  }catch{res.writeHead(404);res.end('Não encontrado');}
}).listen(4174,'127.0.0.1',()=>console.log('Archive: http://127.0.0.1:4174'));
