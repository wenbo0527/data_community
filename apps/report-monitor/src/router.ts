import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Dashboard from './pages/Dashboard.vue'
import Targets from './pages/Targets.vue'
import Rules from './pages/Rules.vue'
import Schedules from './pages/Schedules.vue'
import Runs from './pages/Runs.vue'
import Alerts from './pages/Alerts.vue'
import Settings from './pages/Settings.vue'
import Explore from './pages/Explore.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'Dashboard' } },
  { path: '/dashboard', component: Dashboard, name: 'Dashboard' },
  { path: '/targets', component: Targets, name: 'Targets' },
  { path: '/explore', component: Explore, name: 'Explore' },
  { path: '/rules', component: Rules, name: 'Rules' },
  { path: '/schedules', component: Schedules, name: 'Schedules' },
  { path: '/runs', component: Runs, name: 'Runs' },
  { path: '/alerts', component: Alerts, name: 'Alerts' },
  { path: '/settings', component: Settings, name: 'Settings' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router