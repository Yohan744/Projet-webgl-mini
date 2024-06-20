import { createRouter, createWebHistory } from 'vue-router';
import Index from '../pages/Index.vue';
import ErrorPage from '../pages/Error.vue';

const routes = [
  
    {
        path: '/',
        name: 'Home',
        component: Index,
        alias: '/home/'
    },
  
    {
        path: '/:pathMatch(.*)*',
        name: 'Not-found',
        component: ErrorPage
    }
  
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
