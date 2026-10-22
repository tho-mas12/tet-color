// TN Teachers Platform Service Worker v3.0.0 (5-Stage Architecture Update)
const CACHE_NAME = "tnteachers-pwa-v3";
const STATIC_ASSETS = [
  "/",
  "/student",
  "/materials",
  "/news",
  "/favicon.png",
  "/favicon.ico",
  "/logo.jpg",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json"
];

// Install: Cache static shell and skip waiting immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll partial note:", err);
      });
    })
  );
});

// Activate: Immediately purge all older cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting obsolete cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Network First for all HTML, JS and CSS to ensure zero stale cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API requests from caching
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation requests (HTML pages) -> Network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          if (fallback) return fallback;
          return new Response("Offline. Please reconnect to the internet.", {
            headers: { "Content-Type": "text/html" }
          });
        })
    );
    return;
  }

  // JS and CSS bundle assets -> ALWAYS Network First so users get latest updates immediately!
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Media, Images, Fonts -> Cache First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      }).catch(() => cachedResponse);
    })
  );
});

// Mobile Phone Push Notifications
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "TN Teachers Update", body: event.data.text() };
    }
  }
  const title = data.title || "TN Education Platform";
  const options = {
    body: data.body || "New update available on Education Platform.",
    icon: "/icon-192.png",
    badge: "/favicon.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Handler: Opens/focuses the app on phone
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

