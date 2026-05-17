const CACHE = "smail-v6";
const VERSION = "2.22";

const PRE_CACHE = ["/", "/login", "/register", "/manifest.json", "/offline.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRE_CACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  let isUpdate = false;
  e.waitUntil(
    caches.keys().then(keys => {
      const old = keys.filter(k => k !== CACHE);
      if (old.length > 0) isUpdate = true;
      return Promise.all(old.map(k => caches.delete(k)));
    })
  );
  e.waitUntil(self.clients.claim());
  e.waitUntil((async () => {
    if (isUpdate) {
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(c => c.postMessage({ type: "update", version: VERSION }));
    }
  })());
  checkUpdate();
});

// Network-first for HTML, cache-first for assets, fallback to offline.html
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Never cache API calls
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for static assets
  if (url.pathname.match(/\.(js|css|png|svg|ico|woff2?|apk|json)$/)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
        if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return resp;
      }).catch(() => {
        if (url.pathname.endsWith(".json") || url.pathname.endsWith(".apk")) return new Response("", {status: 503});
        return new Response("", {status: 503});
      }))
    );
    return;
  }

  // Network-first for HTML pages, fallback to cache, then offline page, then inline fallback
  e.respondWith(
    fetch(e.request).then(resp => {
      if (resp.ok) { const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
      return resp;
    }).catch(() => {
      return caches.match(e.request).then(r => r || caches.match("/offline.html").then(r2 => r2 || inlineOffline()));
    })
  );
});

// Auto-update check
async function checkUpdate() {
  try {
    const res = await fetch("/api/version");
    if (!res.ok) return;
    const { version: newVer } = await res.json();
    if (newVer !== VERSION) {
      // Notify all clients
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(c => c.postMessage({ type: "update", version: newVer }));
    }
  } catch {}
}

// Periodic check
setInterval(checkUpdate, 5 * 60 * 1000);

// Inline offline page — ultimate fallback, works even without cache
function inlineOffline() {
  return new Response(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>无网络 — S-MAIL</title><style>:root{--bg:#f8fafc;--text:#0f172a;--muted:#64748b;--blue:#2563eb;--font:"Google Sans","PingFang SC",sans-serif}*{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.c{text-align:center;max-width:360px}.icon{margin:0 auto 24px;width:80px;height:80px;border-radius:24px;background:#e0e7ff;display:flex;align-items:center;justify-content:center}.icon svg{width:40px;height:40px;color:var(--blue);opacity:.8}h1{font-size:20px;font-weight:600;margin-bottom:8px}p{font-size:14px;color:var(--muted);margin-bottom:32px;line-height:1.6}.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:var(--blue);color:#fff;border:none;border-radius:12px;font-family:var(--font);font-size:14px;font-weight:600;cursor:pointer;transition:.15s}.btn:active{background:#1d4ed8}.status{font-size:12px;color:var(--muted);margin-top:24px}.status.online{color:#059669}</style></head><body><div class="c"><div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg></div><h1>无网络连接</h1><p>请检查网络后重试<br>恢复后将自动刷新</p><button class="btn" onclick="retry()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3"/></svg>重试</button><div class="status" id="s">等待网络…</div></div><script>function retry(){s.textContent='检查中…';fetch('/api/version').then(r=>{if(r.ok){s.textContent='已恢复!';s.className='status online';setTimeout(()=>location.reload(),600)}else{s.textContent='服务器异常'}}).catch(()=>{s.textContent='无连接';setTimeout(()=>location.reload(),2000)})}ononline=()=>{s.textContent='网络恢复';setTimeout(()=>location.reload(),400)}</script></body></html>`, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

let pollCount = 0;

// Poll inbox count while SW is active, show notification on new mail
async function pollInbox() {
  try {
    const res = await fetch("/api/inbox");
    if (!res.ok) return;
    const data = await res.json();
    const count = (data.items || []).length;
    if (pollCount > 0 && count > pollCount) {
      const diff = count - pollCount;
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(c => c.postMessage({ type: "new-mail", count: diff }));
      if (clients.length === 0) {
        // No open window — show notification via SW
        const title = diff > 1 ? `${diff} 封新邮件` : "新邮件";
        await self.registration.showNotification(title, {
          body: `收件箱有 ${diff} 封新邮件`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "new-mail",
          vibrate: [200, 100, 200],
          data: { url: "/" }
        });
      }
    }
    pollCount = count;
  } catch {}
}

// Push event from server
self.addEventListener("push", e => {
  let data = { title: "新邮件", body: "您有新邮件" };
  try {
    if (e.data) data = e.data.json();
  } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "new-mail",
      vibrate: [200, 100, 200],
      data: { url: "/" }
    })
  );
  // Also notify open clients
  self.clients.matchAll({ type: "window" }).then(clients => {
    clients.forEach(c => c.postMessage({ type: "notification", title: data.title, body: data.body }));
  });
});

// Notification click — focus or open app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then(clients => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow("/");
    })
  );
});

// Poll inbox every 30s when SW is active
setInterval(pollInbox, 30000);
pollInbox();

// Listen for messages from clients
self.addEventListener("message", e => {
  if (e.data === "skipWaiting") {
    self.skipWaiting();
    self.clients.claim();
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: "reload" }));
    });
  }
  if (e.data === "checkUpdate") checkUpdate();
});
