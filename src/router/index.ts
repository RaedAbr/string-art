import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import Page1 from '@/pages/Page1.vue'
import Page2 from '@/pages/Page2.vue'
import StringArtCanvas from '@/pages/StringArtCanvas.vue'

const routes = [
  {
    path: '/',
    component: HomePage,
    name: 'home',
    children: [
      { path: 'page1', name: "page1", component: Page1 },
      { path: 'page2', name: "page2", component: Page2 },
      { path: 'page3', name: "page3", component: StringArtCanvas },
    ]
  }
] as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router