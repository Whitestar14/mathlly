import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue'
import { setupRouteErrorHandling, routeError, routePath } from './errorHandler'
import db from '@/data/db'

let isInitialNavigation = true

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/layouts/navigation/HomePage.vue'),
    meta: { transition: 'fade' },
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@/layouts/calculators/main/MainCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators' },
  },
  {
    path: '/tools/base64',
    name: 'base64',
    component: () => import('@/layouts/tools/Base64Tool.vue'),
    meta: { transition: 'fade', group: 'tools' },
  },
  {
    path: '/info/update',
    name: 'updates',
    component: () => import('@/layouts/info/UpdatePage.vue'),
    meta: { transition: 'fade', group: 'information' },
  },
  {
    path: '/info/about',
    name: 'about',
    component: () => import('@/layouts/info/AboutPage.vue'),
    meta: { transition: 'fade', group: 'information' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/layouts/utility/SettingsPage.vue'),
    meta: { transition: 'fade', group: 'utility' },
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import('@/layouts/utility/FeedbackPage.vue'),
    meta: { transition: 'fade', group: 'utility' },
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorFallback,
    props: () => ({
      error: routeError.value,
      path: routePath.value,
      isRouteError: true,
    }),
    beforeEnter: (_, __, next) => {
      if (routeError.value) next()
      else {
        console.warn(
          'Direct access to /error page without active error. Redirecting to home.'
        )
        next('/')
      }
    },
    meta: { transition: 'fade', errorPage: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: (to) => {
      const error = {
        status: 404,
        message: 'Page not found',
        originalError: new Error('Not Found'),
      }

      routeError.value = error
      routePath.value = to.fullPath

      return { name: 'error' }
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return {}
  },
})

setupRouteErrorHandling(router)

router.afterEach((to) => {
  const excludedRoutes = ['not-found', 'settings', 'error', 'feedback']

  if (!excludedRoutes.includes(to.name as string) && to.path !== '/') {
    localStorage.setItem('path-lstv', to.fullPath)
  }

  isInitialNavigation = false
})

router.beforeEach(async (to, _, next) => {
  if (to.path === '/' && isInitialNavigation) {
    try {
      const settings = await db.settings.get(1)

      if (settings && settings.startup) {
        const startupNav = settings.startup.navigation

        if (startupNav === 'last-visited') {
          const lastVisitedPath = localStorage.getItem('path-lstv')

          if (lastVisitedPath && lastVisitedPath !== '/') {
            return next(lastVisitedPath)
          }

          const calculatorToolSettings = await db.toolSettings.where('toolId').equals('calculator').first()
          if (calculatorToolSettings) {
            return next('/calculator')
          }
        }

        if (startupNav === 'calculator') {
          return next('/calculator')
        }
      }

      next()
    } catch (error) {
      console.error('Error in navigation guard:', error)
      next()
    }
  } else {
    next()
  }
})

export default router
