const CACHE="libras-studio-mobile-v101",LIBRARY_CACHE="libras-studio-library-v1";const SHELL=["./","./index.html","./vendor/supabase-js-2.116.0.js?v=0540","./app.css?v=0581","./redesign.css?v=0581","./soft-edge.css?v=0581","./app.js?v=0581","./icons.js?v=0581","./config.js","./study.js?v=0581","./explore-data.js?v=0581","./phrase-data.js?v=0581","./phrase-library.js?v=0581","./manifest.webmanifest","./libras_studio.png?v=0581","./version.json","./data/goias_nacional.csv"];
const SHELL_URLS=new Set(SHELL.map(path=>new URL(path,self.registration.scope).href));
const HOME=new URL("./index.html",self.registration.scope).href;
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("libras-studio-mobile-")&&key!==CACHE).map(key=>caches.delete(key))))
  ]));
});
self.addEventListener("message",event=>{if(event.data==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url),scope=new URL(self.registration.scope);
  const sameApp=url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
  if(sameApp&&req.mode==="navigate"){
    event.respondWith(fetch(req,{cache:"no-store"}).catch(async()=>{
      const saved=await caches.match(HOME);
      return saved||Response.error();
    }));
    return;
  }
  if(sameApp&&SHELL_URLS.has(url.href)){
    event.respondWith(fetch(req,{cache:"no-store"}).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone())}
      return response;
    }).catch(async()=>await caches.match(req)||Response.error()));
    return;
  }
  if(!sameApp){
    // Library media are saved only by an explicit app action, never through passive browsing.
    event.respondWith(caches.open(LIBRARY_CACHE).then(async cache=>await cache.match(req)||fetch(req)));
  }
});
