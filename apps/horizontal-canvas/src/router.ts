import { createRouter, createWebHistory } from 'vue-router'
// removed unused App.vue to avoid importing old horizontal modules

const TasksList = () => import('./pages/tasks/TasksList.vue')
const MarketingTasks = () => import('./pages/marketing/tasks/index.vue')
const MarketingHorizontal = () => import('./pages/marketing/tasks/horizontal/index.vue')

// DocRef: 架构文档「关键代码片段/路由定义」
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/marketing/tasks' },
    { path: '/tasks', name: 'tasks-list', component: TasksList },
    { path: '/editor', name: 'editor', component: MarketingHorizontal },
    { path: '/marketing/tasks', name: 'marketing-tasks', component: MarketingTasks },
    { path: '/marketing/tasks/horizontal', name: 'marketing-horizontal', component: MarketingHorizontal }
  ]
})
