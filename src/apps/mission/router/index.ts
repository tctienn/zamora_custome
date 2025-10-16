import type { RouteRecordRaw } from 'vue-router';

/**
 * - To config a route not show in menu, set showInMenu: false
 * - To config a route not show in breadcrumb, set showInBreadcrumb: false
 */
const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/mission/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'MISSION',
    },
    name: 'mission',
    path: '/mission',
    children: [
      {
        component: () => import('@/apps/mission/views/dashboard/DashboardView.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DASHBOARD',
          icon: 'dashboard',
          showInMenu: true,
        },
        name: 'MissionDashboard',
        path: 'dashboard',
      },
      {
        component: () => import('@/apps/mission/views/mission/manager/MissionManager.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'MISSION-MISSION_MANAGEMENT',
          functionMapping: '/MISSION/MISSION_DUTY/MISSION_DUTY-MANAGEMENT',
          icon: 'strategy',
        },
        name: 'missionManagement',
        path: 'mission-management',
      },
      {
        component: () => import('@/apps/mission/views/mission/manager/ActivityManager.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'MISSION-ACTIVITY_MANAGEMENT',
          functionMapping: '/MISSION/MISSION_DUTY/MISSION_DUTY-ACTIVITY',
          isModule: true,
          icon: 'event',
        },
        name: 'activityManagement',
        path: 'activity-management',
      },
      {
        component: () => import('@/apps/mission/views/mission/manager/JobManager.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'MISSION-JOB_MANAGEMENT',
          functionMapping: '/MISSION/MISSION_DUTY/MISSION_DUTY-JOB',
          isModule: true,
          icon: 'assignment',
        },
        name: 'jobManagement',
        path: 'job-management',
      },
      {
        component: () => import('@/apps/mission/views/folder/FolderManager.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'MISSION-JOB_MANAGEMENT',
          isModule: true,
          icon: 'folder',
        },
        name: 'folderManagement',
        path: 'folder-management',
      },
      {
        component: () => import('@/apps/mission/views/mission/manager/NoteRateManager.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'MISSION-NOTE_RATE_MANAGEMENT',
          functionMapping: '/MISSION/MISSION_DUTY/MISSION_DUTY-EVALUATE',
          isModule: true,
          icon: 'rate_review',
        },
        name: 'noteRateManagement',
        path: 'note-rate-management',
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'insert_chart',
          menuCode: 'MISSION-REPORT',
          functionMapping: '/MISSION/MISSION_DUTY/MISSION_DUTY-REPORT',
          showInMenu: true,
        },
        name: 'missionDutyReport',
        path: 'report',
        children: [
          {
            component: () => import('@/apps/mission/views/report/MissionFocusReport.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MISSION-FOCUS-REPORT',
              showInMenu: true,
              icon: 'task_alt',
            },
            name: 'missionFocusReport',
            path: 'mission-focus-report',
          },
          {
            component: () => import('@/apps/mission/views/report/MissionActivityReport.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MISSION-ACTIVITY-REPORT',
              showInMenu: true,
              icon: 'flag',
            },
            name: 'missionActivityReport',
            path: 'mission-activity-report',
          },
          {
            component: () => import('@/apps/mission/views/report/MissionJobReport.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MISSION-JOB-REPORT',
              showInMenu: true,
              icon: 'event_note',
            },
            name: 'missionJobReport',
            path: 'mission-job-report',
          },
          {
            component: () => import('@/apps/mission/views/report/MissionAssignmentReport.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MISSION-ASSIGNMENT-REPORT',
              showInMenu: true,
              icon: 'assignment_ind',
            },
            name: 'missionAssignmentReport',
            path: 'mission-assignment-report',
          },
        ]
      },
      {
        meta: {
          icon: 'tune',
          menuCode: 'MISSION_FUNCTION-CONFIG',
          functionMapping: '/MISSION/MISSION_DUTY/MISSION_DUTY-SETTING',
          showInMenu: true,
        },
        name: 'MissionFunctionConfig',
        path: 'config',
        children: [
          {
            component: () =>
              import(
                '@/apps/mission/views/config/parameterConfig/ParameterConfig.vue'
              ),
            meta: {
              icon: 'format_list_numbered',
              showInMenu: true,
            },
            name: 'MissionParameterConfig',
            path: 'parameter',
          },
        ],
      },
    ]
  }
];

export default routes;
