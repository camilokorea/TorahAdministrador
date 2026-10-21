/*
  Service worker del administrador: lo necesario para instalarlo como app.
  - Páginas: primero la red; sin conexión, la última copia (que avisará que no hay conexión con el servidor).
  - Archivos de /assets (con hash, nunca cambian): primero la caché.
  - La API nunca pasa por aquí: los datos siempre se leen y guardan en el servidor.
*/
const VERSION = 'v1';
const SHELL = `admin-shell-${VERSION}`;
const ASSETS = `admin-assets-${VERSION}`;

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/manifest.webmanifest'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => ![SHELL, ASSETS].includes(k)).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(SHELL).then((c) => c.put('/', copy));
                    return res;
                })
                .catch(() => caches.match('/').then((r) => r || Response.error()))
        );
        return;
    }

    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/favicon/')) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((res) => {
                        if (res.ok) {
                            const copy = res.clone();
                            caches.open(ASSETS).then((c) => c.put(request, copy));
                        }
                        return res;
                    })
            )
        );
    }
});
