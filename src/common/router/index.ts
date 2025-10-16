import { trimStart } from 'lodash';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

import { hasPermission } from '@/apps/admin/services/permission';
import { resetStore } from '@/common/service/reset_store';
import { useAppStore } from '@/common/store/app';
import { defaultRoutes, useMenuStore } from '@/common/store/menu';
import { useUserStore } from '@/common/store/user';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/common/views/authentication/Login.vue'),
    meta: { isPublic: true },
    name: 'Login',
    path: '/login'
  },
  {
    component: () => import('@/common/views/authentication/LoggedOut.vue'),
    meta: { isPublic: true },
    name: 'LoggedOut',
    path: '/logged-out'
  },
  {
    component: () => import('@/common/views/authentication/ForgotPassword.vue'),
    meta: { isPublic: true },
    name: 'ForgotPassword',
    path: '/forgot-password'
  },
  {
    component: () => import('@/common/views/authentication/RecoveryPassword.vue'),
    meta: { isPublic: true },
    name: 'RecoveryPassword',
    path: '/recovery-password/:query?'
  },
  {
    component: () => import('@/common/views/authentication/UpdateNewPassword.vue'),
    meta: { isPublic: true },
    name: 'UpdateNewPassword',
    path: '/update-new-password/:query?'
  },
  {
    component: () => import('@/common/views/error/410.vue'),
    name: 'UrlExpired',
    path: '/url-expired'
  },
  {
    component: () => import('@/common/views/AppHome.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true
    },
    name: 'Home',
    path: '/',
    redirect: '/dashboard',
    children: [
      {
        component: () => import('@/apps/admin/views/personal/Profile.vue'),
        name: 'Profile',
        path: '/profile',
        meta: {
          showInMenu: false,
          functionMapping: '/HRM/'
        },
      },
      {
        component: () => import('@/common/views/notification/NotificationView.vue'),
        name: 'Notification',
        path: '/notification',
      },
      // {
      //   component: () => import('@/common/views/feed/NewsFeed.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     showInMenu: true,
      //     icon: 'apartment'
      //   },
      //   name: 'NewsFeed',
      //   path: 'news-feed',
      // },
      {
        component: () => import('@/common/views/dashboard/DashboardDemo.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          showInBreadcrumb: false,
          icon: 'dashboard'
        },
        name: 'Dashboard',
        path: 'dashboard',
      },
      {
        component: () => import('@/apps/hrm/views/userProfile/UserProfile.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          showInBreadcrumb: false,
          icon: 'person',
          functionMapping: '/HRM/'
        },
        name: 'Person',
        path: 'person',
      },
      {
        component: () => import('@/common/views/search/SearchResult.vue'),
        meta: {
          requiredAuth: true,
          icon: 'text_snippet',
          showInMenu: false
        },
        name: 'SearchResult',
        path: 'system/search',
      },
    ]
  },
  {
    component: () => import('@/common/views/error/403.vue'),
    name: 'NoPermissions',
    path: '/no-permissions'
  },
  {
    component: () => import('@/common/views/error/404.vue'),
    name: 'PageNotFound',
    path: '/:pathMatch(.*)*'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: defaultRoutes(),
  scrollBehavior: (to, from, savePosition) => {
    return savePosition ?? {
      behavior: 'smooth',
      top: 0
    };
  }
});

router.beforeEach((to, from, next) => {
  useAppStore().loading = true;
  const {
    user,
    expired
  } = useUserStore();
  if (!user || !Object.keys(user).length
    || (expired ? new Date(expired) < new Date() : true)) {
    if (to.meta.requiredAuth) {
      resetStore();
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      });
    } else {
      if (typeof from.name === 'undefined' && to.name === 'LoggedOut') {
        next({ name: 'Login' });
      } else {
        next();
      }
    }
  } else {
    if (to.meta.isPublic) {
      next({ path: '/' });
    } else {
      if (!('functionMapping' in to.meta) || hasPermission(to.meta.functionMapping as string)) {
        next();
      } else {
        next({ name: 'NoPermissions' });
      }
    }
  }
});

router.afterEach((to) => {
  useAppStore().loading = false;
  useMenuStore().setCurrentApp(trimStart(to.matched[0].path, '/'));
});

export { router as default, routes };
