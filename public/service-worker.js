self.addEventListener('install', function(event) {
    console.log('Installed service worker!');
});

self.addEventListener('push', async function(event) {
    event.waitUntil(
        self.registration.showNotification('NodeHab', {
            body: await event.data.text(),
        })
    )
})