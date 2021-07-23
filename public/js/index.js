import Nodes from './nodes.js';
import Node from './node.js';

const routes = [
    { path: '/nodes', component: Nodes },
    { path: '/nodes/:id', component: Node }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    router,
    vuetify: new Vuetify(),
}).$mount('#app')
