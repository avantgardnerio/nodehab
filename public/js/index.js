import Dashboard from './dashboard.js';
import Controller from './controller.js';
import Node from './node.js';

const routes = [
    { path: '/dashboard', component: Dashboard },
    { path: '/controller', component: Controller },
    { path: '/nodes/:id', component: Node },
]

const router = new VueRouter({
    routes
})

// Utility function for browser interoperability
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            let subscription = await registration.pushManager.getSubscription();
            if(!subscription) {
                const response = await fetch('/api/vapid/publicKey');
                const vapidPublicKey = await response.json();
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
                console.log('Subscribed');
            } else {
                console.log('Already subscribed');
            }
            await registration.update();
            await fetch('/api/push/register', {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify( subscription, null, 3),
            });
            console.log('Registered');
        } catch(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        }
    });
}

const app = new Vue({
    router,
    vuetify: new Vuetify(),
}).$mount('#app')
