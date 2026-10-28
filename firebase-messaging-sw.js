
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAH_zMNj_j4EmMoX7TIf9RHhIn3MrpYcm8",
  authDomain: "cumpleanos-hoy.firebaseapp.com",
  projectId: "cumpleanos-hoy",
  storageBucket: "cumpleanos-hoy.firebasestorage.app",
  messagingSenderId: "718825836373",
  appId: "1:718825836373:web:db2dbecab3b1f1591ea9dc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || 'Cumpleaños Hoy';

  const notificationOptions = {
    body: payload.notification?.body || '¡Tienes una invitación para jugar!',
    icon: './icon-192.png',
    data: payload.data || {}
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
