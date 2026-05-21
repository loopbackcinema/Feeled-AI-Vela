importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  authDomain: "gen-lang-client-0342576140.firebaseapp.com",
  projectId: "gen-lang-client-0342576140",
  storageBucket: "gen-lang-client-0342576140.firebasestorage.app",
  messagingSenderId: "208105784717",
  appId: "1:208105784717:web:9b1426ac6a2e1fde9ba9c4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'FeelEd AI';
  const body = payload.notification?.body || 'Time to study!';
  self.registration.showNotification(title, {
    body: body,
    icon: '/feeled-logo.webp',
    badge: '/feeled-logo.webp',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open FeelEd AI' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('https://feeledai.com')
    );


cat > public/firebase-messaging-sw.js << 'EOF'
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  authDomain: "gen-lang-client-0342576140.firebaseapp.com",
  projectId: "gen-lang-client-0342576140",
  storageBucket: "gen-lang-client-0342576140.firebasestorage.app",
  messagingSenderId: "208105784717",
  appId: "1:208105784717:web:9b1426ac6a2e1fde9ba9c4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'FeelEd AI';
  const body = payload.notification?.body || 'Time to study!';
  self.registration.showNotification(title, {
    body: body,
    icon: '/feeled-logo.webp',
    badge: '/feeled-logo.webp',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open FeelEd AI' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('https://feeledai.com')
    );
  }
});
