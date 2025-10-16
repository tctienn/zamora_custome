const routes = [
  {
    component: () => import('@/apps/work/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      icon: 'work',
      //functionMapping: '/WORK/',
    },
    path: '/work',
    children: [
      {
        component: () => import('@/apps/work/views/dashboard/index.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DASHBOARD',
          icon: 'dashboard',
          showInMenu: true,
        },
        name: 'WorkDashboard',
        path: 'dashboard',
      },
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     menuCode: 'WORK-MANAGER',
      //     icon: 'manage_accounts',
      //     isModule: true,
      //     //functionMapping: '/WORK/WORK-MANAGER',
      //     showInMenu: true,
      //   },
      //   name: 'WorkManager',
      //   path: 'manage'
      // },
      // children: [
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     menuCode: 'WORK_MANAGER-EMPLOYEE',
      //     //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-EMPLOYEE',
      //     showInMenu: true,
      //   },
      //   name: 'WorkManagerEmployee',
      //   path: 'employee',
      //   children: [
      //     {
      //       component: () => import('@/apps/work/views/manager/employee/EmployeeWorkStatistic.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_MANAGER_EMPLOYEE-STATISTIC',
      //         //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-EMPLOYEE/WORK_MANAGER_EMPLOYEE-STATISTIC',
      //         showInMenu: true,
      //       },
      //       name: 'WorkManagerEmployeeStatistic',
      //       path: 'statistic',
      //     },
      //     {
      //       component: () => import('@/apps/work/views/manager/employee/EmployeeWorkDetail.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_MANAGER_EMPLOYEE-DETAIL',
      //         //functionMapping: '/WORK/WORK_MANAGER-EMPLOYEE/WORK_MANAGER-EMPLOYEE/WORK_MANAGER_EMPLOYEE-DETAIL',
      //         showInMenu: true,
      //       },
      //       name: 'WorkManagerEmployeeDetail',
      //       path: 'detail',
      //     }
      //   ]
      // },
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     menuCode: 'WORK_MANAGER-ASSIGN',
      //     //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-ASSIGN',
      //     showInMenu: true,
      //   },
      //   name: 'WorkManagerAssign',
      //   path: 'assign',
      //   children: [
      //     {
      //       component: () => import('@/apps/work/views/manager/assign/AssignWorkStatistic.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_MANAGER_ASSIGN-STATISTIC',
      //         //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-ASSIGN/WORK_MANAGER_ASSIGN-STATISTIC',
      //         showInMenu: true,
      //       },
      //       name: 'WorkManagerAssignStatistic',
      //       path: 'statistic',
      //     },
      //     {
      //       component: () => import('@/apps/work/views/manager/assign/AssignWorkDetail.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_MANAGER_ASSIGN-DETAIL',
      //         //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-ASSIGN/WORK_MANAGER_ASSIGN-DETAIL',
      //         showInMenu: true,
      //       },
      //       name: 'WorkManagerAssignDetail',
      //       path: 'detail',
      //     }
      //   ]
      // },
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     menuCode: 'WORK_MANAGER-SUPERVISE',
      //     //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-SUPERVISE',
      //     showInMenu: true,
      //   },
      //   name: 'WorkManagerSupervise',
      //   path: 'supervise',
      //   children: [
      //     {
      //       component: () => import('@/apps/work/views/manager/supervise/SuperviseWorkStatistic.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_MANAGER_SUPERVISE-STATISTIC',
      //         //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-SUPERVISE/WORK_MANAGER_SUPERVISE-STATISTIC',
      //         showInMenu: true,
      //       },
      //       name: 'WorkManagerSuperviseStatistic',
      //       path: 'statistic',
      //     },
      //     {
      //       component: () => import('@/apps/work/views/manager/supervise/SuperviseWorkDetail.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_MANAGER_SUPERVISE-DETAIL',
      //         //functionMapping: '/WORK/WORK_MANAGER/WORK_MANAGER-SUPERVISE/WORK_MANAGER_SUPERVISE-DETAIL',
      //         showInMenu: true,
      //       },
      //       name: 'WorkManagerSuperviseDetail',
      //       path: 'detail',
      //     }
      //   ]
      // },
      // {
      //   component: () => import('@/apps/work/views/customer/client/ClientManager.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     icon: 'contacts',
      //     menuCode: 'WORK_FUNCTION_SETTING-CLIENT_MANAGER',
      //     showInMenu: true,
      //   },
      //   name: 'ClientManager',
      //   path: 'clientManager'
      // },
      {
        component: () =>
          import('@/apps/work/views/project/component/ProjectManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'monitoring',
          menuCode: 'WORK_FUNCTION_SETTING-PROJECT_MANAGER',
          showInMenu: true,
        },
        name: 'ProjectManager',
        path: 'projectManager',
      },
      {
        component: () =>
          import('@/apps/work/views/task/manager/TaskManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'fact_check',
          menuCode: 'WORK_FUNCTION_SETTING-TASK_MANAGER',
          showInMenu: true,
        },
        name: 'TaskManager',
        path: 'taskManager',
      },
      {
        component: () =>
          import('@/apps/work/views/manager/ManagerView.vue'),
        meta: {
          // requiredAuth: true,
          icon: 'lan',
          // menuCode: 'WORK_FUNCTION_SETTING-TASK_MANAGER',
          showInMenu: true,
        },
        name: 'ManagerView',
        path: 'managerView',
      },
      {
        component: () => import('@/apps/work/views/report/ReportView.vue'),
        meta: {
          requiredAuth: true,
          icon: 'insert_chart',
          menuCode: 'WORK_FUNCTION-REPORT',
          showInMenu: true,
        },
        name: 'WorkFunctionReport',
        path: 'report',
        redirect: { name: 'ReportMyTask' },
        children: [
          {
            component: () =>
              import('@/apps/work/views/report/MyTaskReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-MY-TASK',
              showInMenu: false,
            },
            name: 'ReportMyTask',
            path: 'myTasksReport',
          },
          {
            component: () =>
              import('@/apps/work/views/report/ProjectSummaryReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-PROJECT-SUMMARY',
              showInMenu: false,
            },
            name: 'ReportProjectSummary',
            path: 'projectsReport',
          },
          {
            component: () =>
              import('@/apps/work/views/report/DeptWorkStatisticsReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-PROJECT-SUMMARY',
              showInMenu: false,
            },
            name: 'DeptWorkStatistics',
            path: 'deptWorkStatistics',
          },
          {
            component: () =>
              import('@/apps/work/views/report/GroupTaskStatisticsReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-PROJECT-SUMMARY',
              showInMenu: false,
            },
            name: 'GroupTaskStatistics',
            path: 'groupTaskStatistics',
          },
          {
            component: () =>
              import('@/apps/work/views/report/DetailProjectsReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-DETAIL-PROJECTS',
              showInMenu: false,
            },
            name: 'DetailProjects',
            path: 'detailProjects',
          },
          {
            component: () =>
              import('@/apps/work/views/report/DeptTaskReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-DEPT_TASK',
              showInMenu: false,
            },
            name: 'DeptTask',
            path: 'deptTask',
          },
          {
            component: () =>
              import('@/apps/work/views/report/ProjectManagementSummaryReport.vue'),
            meta: {
              requiredAuth: true,
              icon: 'insert_chart',
              menuCode: 'WORK_FUNCTION_REPORT-DEPT_TASK',
              showInMenu: false,
            },
            name: 'ProjectManagementReport',
            path: 'projectManagementReport',
          },
        ],
      },
      {
        component: () =>
          import('@/apps/work/views/customer/client/CreateClient.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'WORK_FUNCTION_SETTING-CLIENT_CREATE',
          showInMenu: false,
        },
        name: 'ClientCreate',
        path: 'client',
      },
      {
        component: () =>
          import('@/apps/work/views/customer/client/UpdateClient.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'WORK_FUNCTION_SETTING-CLIENT_CREATE',
          showInMenu: false,
        },
        name: 'ClientUpdate',
        path: 'clientUpdate',
      },
      // ]
      // },
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     menuCode: 'WORK-DATA',
      //     icon: 'work',
      //     //functionMapping: '/WORK/WORK-DATA',
      //     showInMenu: true,
      //   },
      //   name: 'WorkData',
      //   path: 'data',
      //   redirect: '/work/data/list',
      //   children: [
      //     {
      //       component: () => import('@/apps/work/views/data/WorkDataView.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_DATA-LIST',
      //         //functionMapping: '/WORK/WORK_DATA/WORK_DATA-LIST',
      //         showInMenu: false,
      //       },
      //       name: 'WorkDataList',
      //       path: 'list'
      //     },
      //     {
      //       component: () => import('@/apps/work/views/data/WorkDataView.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_DATA-KANBAN',
      //         //functionMapping: '/WORK/WORK_DATA/WORK_DATA-KANBAN',
      //         showInMenu: false,
      //       },
      //       name: 'WorkDataKanban',
      //       path: 'kanban'
      //     },
      //     {
      //       component: () => import('@/apps/work/views/data/WorkDataView.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_DATA-CALENDAR',
      //         //functionMapping: '/WORK/WORK_DATA/WORK_DATA-CALENDAR',
      //         showInMenu: false,
      //       },
      //       name: 'WorkDataCalendar',
      //       path: 'calendar'
      //     },
      //     {
      //       component: () => import('@/apps/work/views/data/components/FormExportTask.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_DATA-LIST',
      //         //functionMapping: '/WORK/WORK_DATA/WORK_DATA-CALENDAR',
      //         showInMenu: false,
      //       },
      //       name: 'FormTaskExport',
      //       path: 'export'
      //     },
      //     {
      //       component: () => import('@/apps/work/views/data/components/FormImportTask.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         menuCode: 'WORK_DATA-LIST',
      //         //functionMapping: '/WORK/WORK_DATA/WORK_DATA-CALENDAR',
      //         showInMenu: false,
      //       },
      //       name: 'FormTaskImport',
      //       path: 'import'
      //     },
      {
        component: () =>
          import('@/apps/work/views/component/view-file/FileViewer.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false,
        },
        name: 'WorkFileViewer',
        path: 'file',
      },
      {
        component: () =>
          import(
            '@/apps/work/views/task/component/detail/document/TaskDocumentViewer.vue'
          ),
        meta: {
          showInMenu: false,
          requiredAuth: true,
        },
        name: 'TaskDocumentViewer',
        path: 'document',
      },
      //   ]
      // },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          icon: 'list',
          menuCode: 'WORK_FUNCTION-SETTING',
          isModule: true,
          showInMenu: true,
        },
        name: 'WorkFunctionCategory',
        path: 'workFunctionCategory',
        children: [
          {
            component: () =>
              import(
                '@/apps/work/views/project/manager/ProjectTypeManager.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'category',
              menuCode: 'WORK_FUNCTION_SETTING-PROJECT_TYPE',
              showInMenu: true,
            },
            name: 'ProjectType',
            path: 'projectType',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/project/manager/ProjectGroupManager.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'category',
              menuCode: 'WORK_FUNCTION_SETTING-PROJECT_GROUP',
              showInMenu: true,
            },
            name: 'ProjectGroup',
            path: 'projectGroup',
          },
          {
            component: () =>
              import('@/apps/work/views/task/manager/TaskGroupManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'category',
              menuCode: 'WORK_FUNCTION_SETTING-TASK_GROUP',
              showInMenu: true,
            },
            name: 'TaskGroup',
            path: 'taskGroup',
          },
        ],
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          icon: 'tune',
          menuCode: 'WORK_FUNCTION-CONFIG',
          isModule: true,
          showInMenu: true,
        },
        name: 'WorkFunctionConfig',
        path: 'workFunctionConfig',
        children: [
          {
            component: () =>
              import(
                '@/apps/work/views/config/configWorkStatus/ConfigWorkStatusManage.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'format_list_numbered',
              menuCode: 'WORK_FUNCTION_SETTING-WORK-STATUS',
              showInMenu: true,
            },
            name: 'WorkStatus',
            path: 'workStatus',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/config/configWorkingTime/ConfigWorkingTimeManage.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'timer',
              menuCode: 'WORK_FUNCTION_SETTING-WORKING_TIME',
              showInMenu: true,
            },
            name: 'WorkingTime',
            path: 'workingTime',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/config/parameterConfig/ParameterSetting.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'numbers',
              menuCode: 'WORK_FUNCTION_SETTING-PARAMETER_CONFIG',
              showInMenu: true,
            },
            name: 'ParameterConfig',
            path: 'parameterConfig',
          },
          {
            component: () => import('@/apps/work/views/label/LabelConfig.vue'),
            meta: {
              requiredAuth: true,
              icon: 'label',
              menuCode: 'WORK_FUNCTION_SETTING-LABEL_CONFIG',
              showInMenu: true,
            },
            name: 'LabelConfig',
            path: 'labelConfig',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/config/configHoliday/ConfigHolidayManage.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'calendar_clock',
              menuCode: 'WORK_FUNCTION_SETTING-HOLIDAY_CONFIG',
              showInMenu: true,
            },
            name: 'HolidayConfig',
            path: 'holidayConfig',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/config/categoryConfig/CategoryGroupConfig.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'interests',
              menuCode: 'WORK_FUNCTION_SETTING-CATEGORY_GROUP_CONFIG',
              showInMenu: true,
            },
            name: 'CategoryGroupConfig',
            path: 'categoryGroupConfig',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/config/categoryConfig/CategoryConfig.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'category',
              menuCode: 'WORK_FUNCTION_SETTING-CATEGORY_CONFIG',
              showInMenu: true,
            },
            name: 'CategoryConfig',
            path: 'categoryConfig',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/config/permissionConfig/PermissionConfig.vue'
              ),
            meta: {
              // requiredAuth: true,
              icon: 'category',
              menuCode: 'WORK_FUNCTION_SETTING-PERMISSION_CONFIG',
              showInMenu: true,
            },
            name: 'PermissionConfig',
            path: 'permissionConfig',
          },
        ],
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          icon: 'shield_person',
          menuCode: 'WORK_FUNCTION-ADMIN',
          isModule: true,
          showInMenu: true,
        },
        name: 'WorkAdmin',
        path: 'workAdmin',
        children: [
          {
            component: () =>
              import(
                '@/apps/work/views/project/component/ProjectManagerForAdmin.vue'
              ),
            meta: {
              icon: 'business_center',
              menuCode: 'WORK_FUNCTION-PROJECT',
              showInMenu: true,
            },
            name: 'Project',
            path: 'project',
          },
          {
            component: () =>
              import(
                '@/apps/work/views/task/manager/TaskManagerForAdmin.vue'
              ),
            meta: {
              icon: 'keep',
              menuCode: 'WORK_FUNCTION-TASK',
              showInMenu: true,
            },
            name: 'Task',
            path: 'task',
          },
        ]
      }
    ],
  },
];

export default routes;
