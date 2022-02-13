self.addEventListener('install', function(event) {
    e.waitUntil(
        caches.open('fox-store').then((cache) => cache.addAll([
          '/',
          '/index.html',
          '/js/index.js',
          '/js/node.js',
          '/js/controller.js',
          '/js/dashboard.js',
          '/img/house-xxl.png',
        ])),
      );

      console.log('Installed service worker!');
});

self.addEventListener('push', async function(event) {
    event.waitUntil(
        self.registration.showNotification('NodeHab', {
            body: await event.data.text(),
        })
    )
})

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});
