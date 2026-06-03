// Masidy PWA Service Worker — install only, no fetch interception
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
