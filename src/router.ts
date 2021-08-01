import VueRouter from 'vue-router'
import { getStableCurrentUserUid } from './firebase'
import NotFoundPage from './NotFound.vue'

const router = new VueRouter({
  linkActiveClass: 'is-active',
  routes: [
    { path: '/', component: () => import('./InfoPage.vue') },
    { path: '/privacy', component: () => import('./Privacy.vue') },
    { path: '/settings', component: () => import('./Settings.vue'), meta: { requiresAuth: true } },
    {
      path: '/(rides|bikes|stations|time)',
      component: () => import('./StatPage.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '/rides', component: () => import('./BubiRides.vue') },
        { path: '/bikes', component: () => import('./Bikes.vue') },
        { path: '/stations', component: () => import('./Stations.vue') },
        { path: '/time', component: () => import('./TimePage.vue') },
      ]
    },
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
