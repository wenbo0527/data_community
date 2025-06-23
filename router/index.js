import { createRouter, createWebHistory } from 'vue-router';
import explorationRoutes from './modules/exploration';
import marketingRoutes from './modules/marketing';
import discoveryRoutes from './modules/discovery';
import touchRoutes from './modules/touch';
import externalDataRoutes from './modules/external-data';
import managementRoutes from './modules/management';

const routes = [
  {
    path: '/',
    redirect: '/exploration/index'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/index.vue')
  },
  ...explorationRoutes,
  ...marketingRoutes,
  ...discoveryRoutes,
  ...touchRoutes,
  ...externalDataRoutes,
  ...managementRoutes
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
