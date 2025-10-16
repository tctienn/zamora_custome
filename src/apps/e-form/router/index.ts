import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/e-form/views/App.vue'),
    meta: {
      // requiredAuth: true,
      showInMenu: true,
      menuCode: 'E-FORM',
      // functionMapping: '/E-FORM'
    },
    name: 'EFrom',
    path: '/e-form',
    children: [
      {
        component: () => import('@/apps/e-form/views/config/EFormManage.vue'),
        meta: {
          // requiredAuth: true,
          showInMenu: true,
          icon: 'category'
        },
        path: 'types',
        name: 'EFormTypeManage',
      },
      {
        component: () => import('@/apps/e-form/views/config/EFormConfig.vue'),
        // meta: { requiredAuth: true, },
        path: 'config/:versionId',
        name: 'EFormConfig',
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'business_center',
          showInMenu: true,
        },
        name: 'WorkFlowProcess',
        path: 'process',
        children: [
          {
            component: () => import('@/apps/work-flow/views/process/work/ProcessManager.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true
            },
            name: 'WorkFlowProcessManager',
            path: 'manage'
          },
          {
            component: () => import('@/apps/work-flow/views/process/detail/WorkDetail.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false
            },
            name: 'WorkFlowProcessWorkDetail',
            path: ':id'
          },
          {
            component: () => import('@/apps/work-flow/views/process/task/TaskManager.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true
            },
            name: 'WorkFlowProcessTaskManager',
            path: 'task',
          },
          {
            component: () => import('@/apps/work-flow/views/process/detail/task/TaskDetail.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false
            },
            name: 'WorkFlowProcessTaskDetail',
            path: 'task/:id'
          }
        ]
      }
    ]
  }
];

export default routes;