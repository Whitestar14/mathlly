import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ref } from 'vue'
import ErrorFallback from '@pages/ErrorFallback.vue'
import { setupRouteErrorHandling, routeError, routePath } from './errorHandler'
import db from '@services/storage/db'
import { useAppStorageStore } from '@stores/appStorage'

let isInitialNavigation = true

export const isRouteLoading = ref(false)

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@pages/HomePage.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@calculator/pages/MainCalculator.vue'),
    meta: { transition: 'fade', group: 'calculators', header: { widgetNames: ['CalculatorModeSwitcher'] } }
  },
  {
    path: '/tools/base64',
    name: 'base64',
    component: () => import('@base64/pages/Base64Tool.vue'),
    meta: { transition: 'fade', group: 'tools' }
  },
  {
    path: '/tools/color',
    name: 'color',
    component: () => import('@color/pages/ColorTool.vue'),
    meta: { transition: 'fade', group: 'tools' }
  },
  {
    path: '/info/update',
    name: 'updates',
    component: () => import('@pages/UpdatePage.vue'),
    meta: { transition: 'fade', group: 'information' }
  },
  {
    path: '/info/about',
    name: 'about',
    component: () => import('@pages/AboutPage.vue'),
    meta: { transition: 'fade', group: 'information' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@settings/pages/SettingsPage.vue'),
    meta: { transition: 'fade', group: 'utility' }
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import('@pages/FeedbackPage.vue'),
    meta: { transition: 'fade', group: 'utility' }
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorFallback,
    props: () => ({
      error: routeError.value,
      path: routePath.value,
      isRouteError: true
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
    meta: { transition: 'fade', errorPage: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: to => {
      const error = {
        status: 404,
        message: 'Page not found',
        originalError: new Error('Not Found')
      }

      routeError.value = error
      routePath.value = to.fullPath

      return { name: 'error' }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return {}
  }
})

setupRouteErrorHandling(router)

router.afterEach(to => {
  isRouteLoading.value = false
  const storageStore = useAppStorageStore()

  const excludedRoutes = ['not-found', 'settings', 'error', 'feedback']

  if (!excludedRoutes.includes(to.name as string) && to.path !== '/') {
    storageStore.set('router', 'lastVisitedPath', to.fullPath)
  }

  isInitialNavigation = false
})

/**
 * future maintainers, do not try to simplify this code without testing it first, as it
  is critical to first-load performance and stability. The navigation guard for '/' is
  intentionally included to avoid routing to the preferred page set in Settings instead
  of staying put on the current page! Please, it took me way too much time than I'll allowed
  to admit to discover why app rerouting and navigation didn't behave as expected.
 */
router.beforeEach(async(to, _, next) => {
  isRouteLoading.value = true

  if (!isInitialNavigation) {
    return next()
  }

  isInitialNavigation = false

  if (to.path !== '/') {
    return next()
  }

  try {
    const storageStore = useAppStorageStore()
    const settings = await db.settings.get(1)

    const startupNav = settings?.startup?.navigation

    if (startupNav === 'last-visited') {
      const lastVisitedPath = storageStore.get('router', 'lastVisitedPath', '/')
      if (lastVisitedPath !== '/') {
        return next(lastVisitedPath)
      }
    }

    if (startupNav === 'calculator') {
      return next('/calculator')
    }

    return next()
  } catch(error) {
    console.error('Error in initial navigation guard:', error)
    return next()
  }
})

router.onError(() => {
  isRouteLoading.value = false
})

export default router
