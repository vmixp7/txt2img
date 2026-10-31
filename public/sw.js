// 最小化 Service Worker：僅供 PWA 安裝條件使用，所有請求直接走網路，不做快取
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
