// Masidy Service Worker — minimal, just enables PWA install
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
// No fetch interception — just registering for PWA installability
