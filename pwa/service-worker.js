const CACHE_NAME = 'cozy-farm-pwa-v1';
const APP_SHELL = [
    './index.html',
    './manifest.webmanifest',
    './icons/farm-icon.svg',
    './icons/farm-icon-180.png',
    './icons/farm-icon-192.png',
    './icons/farm-icon-512.png',
    './vendor/three.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith('cozy-farm-pwa-') && cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(async (response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        await caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
                    }
                    return response;
                })
                .catch((error) => caches.match('./index.html').then((cached) => {
                    if (cached) {
                        return cached;
                    }
                    throw error;
                }))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request).then((response) => {
            if (response.ok) {
                const copy = response.clone();
                return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).then(() => response);
            }
            return response;
        }))
    );
});
