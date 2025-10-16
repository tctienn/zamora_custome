import type { RouteRecordRaw } from 'vue-router';

/**
 * - To config a route not show in menu, set showInMenu: false
 * - To config a route not show in breadcrumb, set showInBreadcrumb: false
 */
const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/search/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'SEARCH',
    },
    name: 'AppSearch',
    path: '/search',
    children: [
      {
        component: () => import('@/apps/search/views/SearchFullApp.vue'),
        meta: {
          isModule: true,
          icon: 'dashboard',
        },
        name: 'AppSearchPage',
        path: ''
      }
    ]
  }
];

export default routes;
