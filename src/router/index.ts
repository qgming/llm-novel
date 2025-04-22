import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import InspirationView from '../views/InspirationView.vue'
import CreateView from '../views/CreateView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/inspiration',
      name: 'inspiration',
      component: InspirationView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/create/:bookId',
      name: 'create',
      component: CreateView,
      props: true
    }
  ]
})

export default router
