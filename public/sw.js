// Service worker : permet d'installer l'appli (Android, iPhone, PC) et de l'ouvrir sans réseau.
// Les pages sont servies « réseau d'abord » (toujours la dernière version), les images « cache d'abord ».
// Le courrier et le registre (/api/) ne sont jamais mis en cache.
const CACHE = "caserne-nf-v217";
const SHELL = ["/", "/images/garde.jpg", "/images/pierre.jpg", "/images/escaliers/brique.jpg", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname === "/version.json") return;

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

// toucher une notification (courrier du vaguemestre) : ouvre ou ramène l'appli
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(liste => {
    const ouverte = liste.find(c => new URL(c.url).origin === location.origin);
    return ouverte ? ouverte.focus() : self.clients.openWindow("/");
  }));
});
