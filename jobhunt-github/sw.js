// 求职记录台 Service Worker
// 改版发布时请把下面的版本号 +1（如 jobhunt-v3），旧缓存会自动清除
const CACHE='jobhunt-v21';
const ASSETS=['./','./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // 页面本身：网络优先（保证能更新到新版本），断网时回退缓存
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(resp=>{
        const cp=resp.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return resp;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  // 其余静态资源：缓存优先，未命中再取网络并写入缓存
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
      const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return resp;
    }))
  );
});
