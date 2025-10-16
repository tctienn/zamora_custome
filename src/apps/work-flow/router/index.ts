import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/work-flow/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true
    },
    name: 'work-flow',
    path: '/work-flow',
    children: []
  }
];

export default routes;