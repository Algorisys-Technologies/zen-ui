/** Faithful replica of the generator against the DEV server, timing each route. */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const s=spawn("npx",["vite","--config","vite.config.demo.ts","--port","5312","--strictPort"],{cwd:"packages/vanilla",stdio:"ignore",detached:true});
for(let i=0;i<80;i++){try{if((await fetch("http://localhost:5312/builder-vanilla/")).ok)break;}catch{}await sleep(500);}
const src=readFileSync("packages/vanilla/src/nav.ts","utf8");
const routes=[...src.matchAll(/\{[^}]*?to: "([^"]+)"[^}]*?\}/g)].filter(m=>m[0].includes("description:")).map(m=>m[1]);
const out="/tmp/genprobe"; mkdirSync(out,{recursive:true});
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1100,height:900},deviceScaleFactor:2});
const base="http://localhost:5312/builder-vanilla";
const slow=[];
let i=0;
for (const route of routes) {
  i++;
  const t=Date.now();
  await p.goto(base+route,{waitUntil:"domcontentloaded",timeout:15000}).catch(()=>{});
  await p.waitForSelector(".demo-page",{timeout:6000}).catch(()=>{});
  await p.waitForSelector(".example-preview",{timeout:3000}).catch(()=>{});
  await sleep(250);
  const el=await p.$(".example-preview");
  if (el) {
    await el.scrollIntoViewIfNeeded().catch(()=>{});
    await sleep(120);
    const box=await el.boundingBox().catch(()=>null);
    if (box) {
      const doc=await p.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,sx:scrollX,sy:scrollY}));
      const clip={x:Math.max(0,box.x+doc.sx),y:Math.max(0,box.y+doc.sy),width:Math.min(340,box.width),height:Math.min(170,box.height)};
      clip.width=Math.max(8,Math.min(clip.width,doc.w-clip.x)); clip.height=Math.max(8,Math.min(clip.height,doc.h-clip.y));
      await p.screenshot({path:join(out,`${i}.jpg`),clip,fullPage:true,type:"jpeg",quality:72,timeout:20000}).catch(e=>slow.push(`${route}: screenshot threw`));
    }
  }
  const ms=Date.now()-t;
  if (ms>2500) { slow.push(`#${i} ${route}: ${ms}ms`); console.log(`SLOW #${i} ${route}: ${ms}ms`); }
}
console.log("\nslow routes:", slow.length?slow:"none");
await b.close(); try{process.kill(-s.pid,"SIGTERM");}catch{}
