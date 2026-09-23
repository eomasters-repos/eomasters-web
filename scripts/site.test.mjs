import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const content=p=>JSON.parse(fs.readFileSync(path.join(root,'content',p),'utf8'));
const routes=content('routes.json');
const dist=path.join(root,'dist');
const htmls=routes.map(r=>({route:r.path,html:fs.readFileSync(path.join(dist,r.file),'utf8')}));
const buildBase=htmls.find(r=>r.route==='/').html.match(/href="([^"]*\/styles.css)"/)[1].replace(/\/styles.css$/,'');
test('All published articles, newsletters and instruments are retained',()=>{
 assert.equal(routes.filter(r=>r.path.startsWith('/post/')).length,28);
 assert.equal(routes.filter(r=>r.path.startsWith('/so/')).length,41);
 const db=content('eo-data.json');assert.equal(db.length,40);assert.equal(new Set(db.map(d=>d.name)).size,40);
 for(const row of db){assert.ok(row.sensor.length&&row.theme.length&&row.platform.length);assert.ok(row.sources.length);for(const s of row.sources)assert.match(s.url,/^https?:\/\//);}
});
test('Local navigation and media all resolve, both at root and repository path',()=>{
 const failures=[];
 for(const {route,html} of htmls){const base=buildBase;
  for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(!raw.startsWith('/')||raw.startsWith('//'))continue;const url=new URL(raw.replaceAll('&amp;','&'),'https://local');let p=decodeURIComponent(url.pathname);if(base&&p.startsWith(base+'/'))p=p.slice(base.length);let file=path.join(dist,p);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file))failures.push(`${route}: ${p}`);}
 }assert.deepEqual([...new Set(failures)],[]);
});
test('No Wix runtime, comments, account controls or business-card embeds are shipped',()=>{
 for(const {route,html} of htmls){assert.doesNotMatch(html,/lemontaps\.com|static\.parastorage\.com|comments-section|wix-warmup|<iframe/i,route);}
 const home=htmls.find(x=>x.route==='/').html;assert.doesNotMatch(home,/href="[^"]*\/(groups|members)\//);
});
test('Code examples and article contents are substantial',()=>{
 for(const f of fs.readdirSync(path.join(root,'content/posts'))){const post=content('posts/'+f);assert.ok(post.html.length>500,f);assert.ok(post.date,f);}
 const py=content('posts/post__the-new-pyeditor-in-eomtbx-pro.json');assert.match(py.html,/from.*snapkit/);assert.match(py.html,/<pre/);
 for(const f of fs.readdirSync(path.join(root,'content/newsletters'))){const n=content('newsletters/'+f);assert.ok(n.html.length>600,f);assert.doesNotMatch(n.html,/href="#"/,'Unresolved newsletter link in '+f);}
});
test('Accessible page basics and no external images',()=>{
 for(const {route,html} of htmls.filter(x=>!routes.find(r=>r.path===x.route).redirect)){assert.match(html,/<html lang="en"/);assert.match(html,/<h1/);assert.match(html,/<main id="main"/);assert.match(html,/<title>.+<\/title>/);assert.doesNotMatch(html,/<img[^>]*src="https?:/,'External image in '+route);}
});
