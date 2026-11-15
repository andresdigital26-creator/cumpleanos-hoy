
const CACHE_NAME = 'cumpleanos-hoy-v4';

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

// Activación y limpieza de cachés anteriores
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

// Actualización automática de contenido
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, copy);
        });
      }

      return response;
    }).catch(async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      if (request.mode === 'navigate') {
        return await caches.match('./index.html') ||
          new Response('Sin conexión. Intentá nuevamente.', {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          });
      }

      return new Response('', { status: 503 });
    })
  );
});

// Al tocar una notificación, abrir la aplicación
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

      return self.clients.openWindow('./index.html');
    })
  );
});
