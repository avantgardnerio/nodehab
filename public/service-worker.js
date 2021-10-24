self.addEventListener('install', function(event) {
    console.log('Installed service worker!');
});

self.addEventListener('push', function(event) {
    console.log(event);
    event.waitUntil(
        self.registration.showNotification('ServiceWorker Cookbook', {
            body: 'Alea iacta est',
        })
    )
})