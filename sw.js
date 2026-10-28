---
layout: null
---
// Offline support. Pages are fetched fresh from the network and saved as
// a fallback; files (CSS, JS, fonts, images) are served from the cache
// first, which is safe because their links change on every build (?v=).
{%- assign v = site.time | date: '%s' %}

const CACHE = 'fajis-{{ v }}';
const OFFLINE_PAGE = '/offline/';

// Saved on install, so the home page, the game and the offline page
// work even if they were never opened
const PRECACHE = [
    '/',
    '/play/',
    OFFLINE_PAGE,
    '/assets/css/style.css?v={{ v }}',
    '/assets/js/main.js?v={{ v }}',
    '/assets/js/palette.js?v={{ v }}',
    '/assets/js/game.js?v={{ v }}',
    '/assets/fonts/inter-latin-wght-normal.woff2',
    '/assets/fonts/jetbrains-mono-latin-wght-normal.woff2',
    '/favicon.svg',
    '/favicon-32x32.png',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

// Remove caches from older builds
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE);
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch (error) {
        return (await cache.match(request, { ignoreSearch: true })) || cache.match(OFFLINE_PAGE);
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
}

self.addEventListener('fetch', event => {
    const { request } = event;
    // Only this site's own GET requests; GitHub, the contact form and stats go straight out
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
    event.respondWith(request.mode === 'navigate' ? networkFirst(request) : cacheFirst(request));
});
