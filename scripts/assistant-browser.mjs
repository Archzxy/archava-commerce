const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
import { readFile, mkdir, mkdtemp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const scratch=await mkdtemp(resolve(tmpdir(),'kala-ava-browser-'));
const shots=resolve(root,'.logs/assistant-browser');
await mkdir(shots,{recursive:true});
const harnessSource=`import React from '${root}/archava/node_modules/react/index.js';
import { createRoot } from '${root}/archava/node_modules/react-dom/client.js';
import { ShoppingWorkspace } from '${root}/archava/src/components/ShoppingWorkspace.tsx';
import * as shopping from '${root}/archava/src/lib/assistant.ts';
import { createAssistantChannel } from '${root}/archava/src/lib/assistantChannel.ts';
import { preserveCallNavigation } from '${root}/archava/src/lib/navigation.ts';
const receipts:any[]=[];
const channel=createAssistantChannel(async(data,topic)=>{receipts.push({topic,value:JSON.parse(new TextDecoder().decode(data))});}, 'test-voice-agent');
shopping.beginShoppingSession();
preserveCallNavigation(true);
createRoot(document.getElementById('archava-widget-root')!).render(<div className="av-root"><aside className="av-panel is-open"><header className="av-header"><div><strong>Ava — test transport</strong><span>Simulated voice, actual browser actions</span></div></header><ShoppingWorkspace /></aside></div>);
(window as any).__avaTest={
 async send(action:string,payload:any,requestId=crypto.randomUUID(),identity='test-voice-agent'){
  await channel.receive(new TextEncoder().encode(JSON.stringify({action,payload,requestId})),identity,shopping.ASSISTANT_ACTION_TOPIC);
  return receipts.at(-1)?.value;
 },
 state:shopping.getShoppingState,
 end(){shopping.endShoppingSession();preserveCallNavigation(false);},
 resume(){shopping.beginShoppingSession();preserveCallNavigation(true);},
 undo:shopping.undoAssistantCart,
};
`;
const { writeFile }=await import('node:fs/promises');
await writeFile(resolve(scratch,'harness.tsx'),harnessSource);
execFileSync(resolve(root,'archava/node_modules/.bin/esbuild'),[resolve(scratch,'harness.tsx'),'--bundle','--format=esm','--jsx=automatic',`--alias:react=${root}/archava/node_modules/react`,`--outfile=${scratch}/harness.js`],{stdio:'pipe'});
const harness=await readFile(resolve(scratch,'harness.js'),'utf8');
const probe=createServer();await new Promise(resolveReady=>probe.listen(0,'127.0.0.1',resolveReady));
const port=probe.address().port;await new Promise(resolveClose=>probe.close(resolveClose));
const server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
const base=`http://localhost:${port}`;
let browser;
const report=[];
function deadline(promise, label) {
 let timer;
 return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} timed out`)),15000);})]).finally(()=>clearTimeout(timer));
}
try {
 for(let attempt=0;attempt<50;attempt++){
  try{const response=await fetch(base);if(response.ok)break;}catch{}
  if(attempt===49)throw new Error('Marketplace test server did not start');
  await new Promise(resolveWait=>setTimeout(resolveWait,100));
 }
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {}),args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for(const width of [1440,390,320]){
 const context=await browser.newContext({viewport:{width,height:1000}});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/assets/archava/widget.js',route=>route.fulfill({contentType:'application/javascript',body:'import "/ava-harness.js";'}));
 await page.route('**/ava-harness.js',route=>route.fulfill({contentType:'application/javascript',body:harness}));
 await page.goto(`${base}/produk`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__avaTest&&window.kalaCart);
 const send=(action,payload={})=>page.evaluate(async({action,payload})=>window.__avaTest.send(action,payload),{action,payload});
 let result=await send('update_brief',{brief:{budget:500000,useCase:'Kerja dan perjalanan',priority:'battery',query:'headphone',category:'all'}});
 assert.equal(result.status,'applied');
 assert.match(await page.locator('.av-brief-chips').textContent(),/500\.000/);
 result=await send('filter_catalog',{query:'headphone',category:'all',minPrice:0,maxPrice:500000,sort:'price-asc'});
 assert.equal(result.code,'filters_applied');assert.match(page.url(),/max=500000/);
 const prices=await page.locator('#mainContent .product-price').allTextContents();
 assert.ok(prices.length>=2); assert.ok(prices.every(price=>Number(price.replace(/\D/g,''))<=500000));
 const numeric=prices.map(price=>Number(price.replace(/\D/g,''))); assert.deepEqual(numeric,[...numeric].sort((a,b)=>a-b));
 result=await send('recommend_products',{productIds:['headphones','ritme-lite']}); assert.equal(result.status,'applied');
 await page.locator('[data-ava-recommendation-id="headphones"]').waitFor();
 assert.match(await page.locator('.av-recommendations').textContent(),/30 jam/);
 result=await send('focus_product',{productId:'headphones',field:'batteryHours'});assert.equal(result.code,'product_focused');
 assert.match(page.url(),/\/produk\/headphones$/);
 assert.equal(await page.locator('[data-ava-field="batteryHours"].ava-highlight').count(),1);
 assert.equal(await page.locator('#panel-specifications').isVisible(),true);
 await send('recommend_products',{productIds:['headphones','ritme-lite']});
 await page.locator('.av-compare-link').click(); await page.waitForURL(/bandingkan/);
 assert.match(page.url(),/bandingkan/);
 result=await send('focus_product',{productId:'ritme-lite',field:'batteryHours'});assert.equal(result.code,'product_focused');
 assert.match(page.url(),/bandingkan/);
 assert.equal(await page.locator('td.ava-highlight[data-ava-product="ritme-lite"]').count(),1);
 await page.evaluate(()=>window.kalaCart.add('ritme-lite',2,0));
 const proposalId='proposal-test-123';
 await page.evaluate(async(requestId)=>window.__avaTest.send('request_cart',{productId:'headphones',quantity:1},requestId),proposalId);
 assert.deepEqual(await page.evaluate(()=>window.kalaCart.read()),[{id:'ritme-lite',quantity:2}]);
 await page.getByRole('button',{name:'Ya, tambahkan',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.kalaCart.read().find(p=>p.id==='headphones')?.quantity),1);
 // Replay the exact proposal must not reopen confirmation or add a second item.
 await page.evaluate(async(requestId)=>window.__avaTest.send('request_cart',{productId:'headphones',quantity:1},requestId),proposalId);
 assert.equal(await page.locator('.av-cart-confirmation').count(),0);
 await page.getByRole('button',{name:'Urungkan penambahan terakhir'}).click();
 assert.deepEqual(await page.evaluate(()=>window.kalaCart.read()),[{id:'ritme-lite',quantity:2}]);
 await send('request_cart',{productId:'headphones',quantity:1});
 await page.evaluate(()=>window.kalaCart.add('headphones',1,0));
 await page.getByRole('button',{name:'Ya, tambahkan',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.kalaCart.read().find(p=>p.id==='headphones')?.quantity),1);
 assert.match(await page.locator('.av-action-notice').textContent(),/Keranjang berubah/);
 // Cart changes on checkout refresh public totals without reading or clearing recipient fields.
 await page.evaluate(()=>window.kalaNavigate('/checkout'));
 await page.locator('input[name="recipient"]').fill('Private test recipient');
 const checkoutReceipt=await send('request_cart',{productId:'ritme-lite',quantity:1});
 assert.ok(!JSON.stringify(checkoutReceipt).includes('Private test recipient'));
 await page.getByRole('button',{name:'Ya, tambahkan',exact:true}).click();
 assert.equal(await page.locator('input[name="recipient"]').inputValue(),'Private test recipient');
 assert.match(await page.locator('.checkout-products').textContent(),/3 ×/);
 await page.getByRole('button',{name:'Urungkan penambahan terakhir'}).click();
 assert.equal(await page.locator('input[name="recipient"]').inputValue(),'Private test recipient');
 assert.match(await page.locator('.checkout-products').textContent(),/2 ×/);
 // Needs corrected through the actual UI invalidate old recommendations.
 await page.getByText('Koreksi kebutuhan',{exact:true}).click();
 await page.getByLabel('Budget maksimal Ava').fill('600000');
 await page.getByRole('button',{name:'Simpan kebutuhan'}).click();
 assert.equal(await page.locator('.av-recommendation').count(),0);
 await send('recommend_products',{productIds:['headphones','audia-focus-one','ritme-lite']});
 await page.evaluate(()=>window.__avaTest.end());
 await page.getByRole('heading',{name:'Ringkasan belanja',exact:true,level:3}).waitFor();
 assert.equal(await page.locator('.av-recommendation').count(),3);
 const stored=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('kala-ava-summary')));
 assert.deepEqual(Object.keys(stored).sort(),['brief','recommendationIds','savedAt']);
 assert.equal(stored.brief.budget,600000);
 const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth>innerWidth,panel:document.querySelector('.av-panel').scrollWidth>document.querySelector('.av-panel').clientWidth}));
 assert.deepEqual(overflow,{document:false,panel:false});
 await page.screenshot({path:`${shots}/summary-${width}.png`,fullPage:false});
 await page.reload({waitUntil:'networkidle'}); await page.waitForFunction(()=>window.__avaTest);
 assert.equal(await page.locator('.av-recommendation').count(),3);
 assert.equal(await page.evaluate(()=>window.__avaTest.state().brief.budget),600000);
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage unavailable','QuotaExceededError');};});
 await send('request_cart',{productId:'ritme-lite',quantity:1});
 await page.getByRole('button',{name:'Ya, tambahkan',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.kalaCart.read().find(item=>item.id==='ritme-lite')?.quantity),3);
 await page.getByRole('button',{name:'Urungkan penambahan terakhir'}).click();
 assert.equal(await page.evaluate(()=>window.kalaCart.read().find(item=>item.id==='ritme-lite')?.quantity),2);
 // Load the shipped widget with saved needs, while keeping providers disabled.
 await page.unroute('**/assets/archava/widget.js');
 await page.route('**/api/config',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({sessionsEnabled:false,providerConfigured:false,avatarProvider:'voice',sessionSeconds:120})}));
 await page.reload({waitUntil:'networkidle'});
 await page.locator('.av-launcher').click();
 assert.equal(await page.locator('.av-launcher').isVisible(),false);
 assert.equal(await page.getByRole('heading',{name:'Ringkasan belanja',exact:true,level:3}).isVisible(),false);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.av-panel')).opacity==='1');
 const compact=await page.locator('.av-panel').boundingBox();
 assert.ok(compact.width<=300&&compact.height<470);
 const tray=await page.locator('.comparison-tray:not([hidden])').boundingBox();
 if(tray)assert.ok(compact.y+compact.height<=tray.y,'Ava panel must clear the comparison tray');
 await page.screenshot({path:`${shots}/compact-${width}.png`,fullPage:false});
 await page.getByRole('button',{name:'Buka chat',exact:true}).click();
 await page.getByRole('heading',{name:'Ringkasan belanja',exact:true,level:3}).waitFor();
 assert.equal(await page.locator('.av-recommendation').count(),3);
 assert.equal(await page.getByRole('button',{name:'Mulai ngobrol',exact:true}).count(),0);
 assert.equal(await page.locator('.av-call-actions > button').count(),3);
 await page.getByRole('button',{name:'Coba lagi',exact:true}).waitFor();
 await page.getByRole('button',{name:'Tutup chat',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'Ringkasan belanja',exact:true,level:3}).isVisible(),false);
 await page.getByRole('button',{name:'Minimalkan Ava',exact:true}).click();
 await page.locator('.av-launcher').waitFor({state:'visible'});
 assert.equal(await page.locator('.av-launcher').evaluate(element=>element===document.activeElement),true);
 await page.keyboard.press('Enter');
 assert.equal(await page.locator('.av-launcher').isVisible(),false);
 await page.getByRole('button',{name:'Buka chat',exact:true}).click();
 if(width<=640){
  await page.evaluate(()=>window.dispatchEvent(new Event('archava:show-page')));
  await page.waitForFunction(()=>document.querySelector('.av-panel').classList.contains('is-minimized'));
  await page.evaluate(()=>window.dispatchEvent(new Event('archava:show-shopping')));
  await page.waitForFunction(()=>document.querySelector('.av-panel').classList.contains('is-open'));
 }
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.av-panel')).opacity==='1');
 await page.screenshot({path:`${shots}/widget-${width}.png`,fullPage:false});
 assert.deepEqual(errors,[]);
 // Cancel an allocation in flight: one click starts, rapid repeats do not duplicate,
 // and a late API response is ended instead of joining a hidden ghost room.
 await page.getByRole('button',{name:'Minimalkan Ava',exact:true}).click();
 await context.grantPermissions(['microphone']);
 await page.unroute('**/api/config');
 await page.route('**/api/config',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({sessionsEnabled:true,providerConfigured:true,avatarProvider:'voice',sessionSeconds:120})}));
 let allocationCount=0,releaseAllocation,allocationStarted,endReceived;
 const started=new Promise(resolve=>allocationStarted=resolve);
 const ended=new Promise(resolve=>endReceived=resolve);
 const release=new Promise(resolve=>releaseAllocation=resolve);
 await page.route('**/api/session',async route=>{allocationCount++;allocationStarted();await release;await route.fulfill({contentType:'application/json',body:JSON.stringify({serverUrl:'wss://must-not-join.invalid',token:'unused-cancelled-token',ticket:'cancelled-allocation-ticket',endsAt:Math.floor(Date.now()/1000)+120,avatarProvider:'voice'})});});
 await page.route('**/api/session/end',async route=>{assert.equal(route.request().postDataJSON().ticket,'cancelled-allocation-ticket');await route.fulfill({contentType:'application/json',body:'{"ok":true}'});endReceived();});
 let ghostConnections=0;
 page.on('websocket',socket=>{if(socket.url().includes('must-not-join.invalid'))ghostConnections++;});
 await page.locator('.av-launcher').evaluate(button=>{button.click();button.click();});
 await deadline(started,'session allocation');
 assert.equal(allocationCount,1);
 assert.equal(await page.locator('.av-launcher').isVisible(),false);
 assert.equal(await page.locator('.av-call-actions > button').count(),3);
 await page.getByRole('button',{name:'Disconnect Ava',exact:true}).click();
 await page.locator('.av-launcher').waitFor({state:'visible'});
 releaseAllocation();
 await deadline(ended,'late allocation cleanup');
 assert.equal(ghostConnections,0);
 assert.equal(await page.locator('.av-panel').getAttribute('aria-hidden'),'true');
 assert.deepEqual(errors,[]);
 report.push({width,result:'passed',scenarios:17,errors});
 await context.close();
}
console.log(JSON.stringify(report,null,2));
} finally {await browser?.close();server.kill('SIGTERM');}
