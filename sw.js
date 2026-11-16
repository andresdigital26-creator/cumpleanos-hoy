
const CACHE_NAME = 'cumpleanos-hoy-v8';

// Firebase
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: "AIzaSyAH_zMNj_j4EmMoX7TIf9RHhIn3MrpYcm8",
  authDomain: "cumpleanos-hoy.firebaseapp.com",
  projectId: "cumpleanos-hoy",
  storageBucket: "cumpleanos-hoy.firebasestorage.app",
  messagingSenderId: "718825836373",
  appId: "1:718825836373:web:db2dbecab3b1f1591ea9dc"
});

const messaging = firebase.messaging();

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith('cumpleanos-hoy-') &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Notificaciones recibidas en segundo plano
messaging.onBackgroundMessage(payload => {
  const title =
    payload.notification?.title || 'Cumpleaños Hoy';

  const options = {
    body:
      payload.notification?.body ||
      'Tenés una nueva notificación.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: payload.data || {}
  };

  return self.registration.showNotification(title, options);
});

// Actualización automática de archivos
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();

        event.waitUntil(
          caches.open(CACHE_NAME).then(cache =>
            cache.put(request, copy)
          )
        );
      }

      return response;
    }).catch(async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      if (request.mode === 'navigate') {
        return new Response(
          'Sin conexión. Intentá nuevamente.',
          {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          }
        );
      }

      return new Response('', { status: 503 });
    })
  );
});

// Al tocar una notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }

      return self.clients.openWindow('./');
    })
  );
});
