// Service Worker for LibraLab PWA Tools
const CACHE_NAME = 'libralab-tools-v1';

self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activating');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple fetch strategy - always try network first
    event.respondWith(
        fetch(event.request).catch(() => {
            // If network fails, try cache
            return caches.match(event.request);
        })
    );
});