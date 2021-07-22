import Nodes from './nodes.js';

const Bar = { template: '<div>bar</div>' }

const routes = [
    { path: '/nodes', component: Nodes },
    { path: '/bar', component: Bar }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    router,
    vuetify: new Vuetify(),
}).$mount('#app')
