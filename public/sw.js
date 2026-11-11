// Service worker : permet d'installer l'appli (Android, iPhone, PC) et de l'ouvrir sans réseau.
// Les pages sont servies « réseau d'abord » (toujours la dernière version), les images « cache d'abord ».
// Le courrier et le registre (/api/) ne sont jamais mis en cache.
const CACHE = "caserne-nf-v790";
const SHELL = ["/", "/images/garde.jpg", "/images/pierre.jpg", "/images/escaliers/brique.jpg", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && !k.startsWith("caserne-videos")).map(k => caches.delete(k))))   // (les vidéos gardées sur l'appareil survivent aux mises à jour)
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/videos/") || url.pathname === "/version.json") return;   // (les vidéos : lues par morceaux, jamais mises en cache)

  if (e.request.mode === "navigate") {
    // seule la page d'accueil est gardée pour l'ouverture hors ligne (pas la page de la borne)
    if (url.pathname !== "/" && url.pathname !== "/index.html") return;
    e.respondWith(fetch(e.request)
      .then(res => { const copie = res.clone(); caches.open(CACHE).then(c => c.put("/", copie)); return res; })
      .catch(() => caches.match("/")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok) { const copie = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
    return res;
  })));
});

// une notification arrive (courrier, mise à jour) : même appli fermée
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (er) { d = { corps: e.data && e.data.text() }; }
  const appel = /^appel-/.test(d.tag || "");   // (un appel en hologramme : comme un vrai appel — deux boutons, et la notification reste jusqu'à la réponse)
  e.waitUntil(self.registration.showNotification(d.titre || "Caserne Nouvelle-France", { body: d.corps || "", icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: d.tag || undefined, renotify: !!d.tag, data: { url: d.url || "/" },
    ...(appel ? { requireInteraction: true, vibrate: [500, 250, 500, 250, 500, 250, 500], actions: [{ action: "decrocher", title: "✅ Décrocher" }, { action: "refuser", title: "Refuser" }] } : {}) }));
});
// toucher une notification (courrier du vaguemestre) : ouvre ou ramène l'appli
self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (e.action === "refuser") return;   // (refuser : la notification disparaît ; l'appel s'arrête de lui-même)
  const dec = e.action === "decrocher";
  if (dec && e.notification.data && e.notification.data.url) e.notification.data.url += "&decrocher=1";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(liste => {
    const ouverte = liste.find(c => new URL(c.url).origin === location.origin);
    const url = (e.notification.data && e.notification.data.url) || "/";
    if (url !== "/") {   // (un appel en hologramme : la page de l'hologramme déjà ouverte revient au premier plan — elle se rebranche et l'appel y sonne ; sinon on l'ouvre)
      const holo = liste.find(c => /\/holo(\.html)?(\?|$)/.test(new URL(c.url).pathname + new URL(c.url).search));
      if (holo) { if (dec) holo.postMessage({ t: "decrocher", id: new URL(url, location.origin).searchParams.get("appel") }); return holo.focus(); }
      return self.clients.openWindow(url); }
    return ouverte ? ouverte.focus() : self.clients.openWindow("/");
  }));
});
