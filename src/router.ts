import VueRouter from 'vue-router'
import { getStableCurrentUserUid } from './firebase'
import NotFoundPage from './NotFound.vue'

const router = new VueRouter({
  linkActiveClass: 'is-active',
  routes: [
    { path: '/', component: () => import('./InfoPage.vue') },
    { path: '/privacy', component: () => import('./Privacy.vue') },
    { path: '/settings', component: () => import('./Settings.vue'), meta: { requiresAuth: true } },
    { path: '/rides', component: () => import('./BubiRides.vue'), meta: { requiresAuth: true } },
    { path: '/bikes', component: () => import('./Bikes.vue'), meta: { requiresAuth: true } },
    { path: '/stations', component: () => import('./Stations.vue'), meta: { requiresAuth: true } },
    { path: '/time', component: () => import('./TimePage.vue'), meta: { requiresAuth: true } },
    { path: '*', component: NotFoundPage }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    getStableCurrentUserUid()
      .then(uid => {
        if (!uid) {
          next({
            path: '/'
          })
        } else {
          next()
        }
      })
  } else {
    next()
  }
})

export default router
