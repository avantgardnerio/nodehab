import Dashboard from './dashboard.js';
import Controller from './controller.js';
import Node from './node.js';

const routes = [
    { path: '/dashboard', component: Dashboard },
    { path: '/controller', component: Controller },
    { path: '/nodes/:id', component: Node }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    router,
    vuetify: new Vuetify(),
}).$mount('#app')
