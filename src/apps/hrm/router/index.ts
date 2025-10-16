import { type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/hrm/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'HRM',
      functionMapping: '/HRM/'
    },
    name: 'Hrm',
    path: '/hrm',
    children: [
      {
        component: () => import('@/apps/hrm/views/dashboard/Dashboard.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'DASHBOARD',
          icon: 'dashboard',
          showInMenu: true,
        },
        name: 'HrmDashboard',
        path: 'dashboard',
      },
      {
        component: () =>
          import('@/apps/hrm/views/profile/HrmProfileManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'folder_shared',
          showInMenu: true,
          menuCode: 'HRM_PROFILE',
          functionMapping: '/HRM/HRM_PROFILE',
        },
        name: 'HrmProfileManager',
        path: 'profile',
      },
      {
        component: () => import('@/apps/hrm/views/contract/HrmContractManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'contract',
          showInMenu: true,
          menuCode: 'HRM_CONTRACT',
          functionMapping: '/HRM/HRM_CONTRACT_DECISION/HRM_CONTRACT'
        },
        name: 'HrmContract',
        path: 'contract',
      },
      {
        component: () => import('@/apps/hrm/views/decision/DecisionManage.vue'),
        meta: {
          requiredAuth: true,
          icon: 'notification_multiple',
          showInMenu: true,
          menuCode: 'HRM_DECISION',
          functionMapping: '/HRM/HRM_CONTRACT_DECISION/HRM_DECISION'
        },
        name: 'HrmDecision',
        path: 'decision',
      },
      {
        component: () =>
          import('@/apps/hrm/views/workingAndLeave/WorkingAndLeave.vue'),
        meta: {
          requiredAuth: true,
          icon: 'free_cancellation',
          showInMenu: true,
          menuCode: 'HRM_WORKING_AND_LEAVE',
          functionMapping: '/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_LEAVE'
        },
        name: 'HrmWorkingAndLeave',
        path: 'attendance-leave',
        redirect: { name: 'CheckInOut' },
        children: [
          {
            component: () =>
              import('@/apps/hrm/views/checkin/HrmCheckIn.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping: '/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_CHECKIN'
            },
            name: 'CheckInOut',
            path: 'check-in',
          },
          {
            component: () => import('@/apps/hrm/views/checkin/HrmCheckinDetail.vue'),
            meta: { requiredAuth: true, },
            name: 'HrmCheckInDetail',
            path: 'check-in/:employeeId',
          },
          {
            component: () =>
              import(
                '@/apps/hrm/views/workingAndLeave/HrmTimeSheet.vue'
              ),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping: '/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_TIMESHEET'
            },
            name: 'Timesheet',
            path: 'timesheet',
          },
          {
            component: () =>
              import(
                '@/apps/hrm/views/workingAndLeave/LeaveManage.vue'
              ),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              functionMapping: '/HRM/HRM_ATTENDANCE/HRM_ATTENDANCE_LEAVE'
            },
            name: 'Leave',
            path: 'leave',
          }
        ]
      },
      {
        component: () =>
          import('@/apps/hrm/views/salaryAndTax/SalaryAndTaxManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'request_quote',
          showInMenu: true,
          menuCode: 'HRM_SALARY_AND_TAX',
          functionMapping: '/HRM/HRM_PAYROLL/HRM_PAYROLL_'
        },
        name: 'HrmSalaryAndTax',
        path: 'salary-tax',
      },
      {
        component: () => import('@/apps/hrm/views/insurance/Insurance.vue'),
        meta: {
          requiredAuth: true,
          icon: 'admin_panel_settings',
          showInMenu: true,
          menuCode: 'HRM_INSURANCE',
        },
        name: 'HrmInsurance',
        path: 'insurance',
      },
      {
        component: () => import('@/apps/hrm/views/reward/Reward.vue'),
        meta: {
          requiredAuth: true,
          icon: 'grade',
          showInMenu: true,
          menuCode: 'HRM_REWARD',
          functionMapping: '/HRM/HRM_DEVELOPMENT/HRM_REWARD'
        },
        name: 'HrmReward',
        path: 'reward',
      },
      {
        component: () => import('@/apps/hrm/views/training/Training.vue'),
        meta: {
          requiredAuth: true,
          icon: 'school',
          showInMenu: true,
          menuCode: 'HRM_TRAINING',
          functionMapping: '/HRM/HRM_DEVELOPMENT/HRM_TRAINING'
        },
        name: 'HrmTraining',
        path: 'training',
      },
      {
        component: () => import('@/apps/hrm/views/recruitment/recruitment/HrmRecruitmentManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'article',
          showInMenu: true,
          menuCode: 'HRM_RECRUITMENT',
        },
        name: 'HrmRecruitment',
        path: 'recruitment',
      },
      {
        component: () => import('@/apps/hrm/views/evaluate/HrmEvaluateManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'fact_check',
          showInMenu: true,
          menuCode: 'HRM_EVALUATE'
        },
        name: 'HrmEvaluate',
        path: 'evaluate',
      },
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     icon: 'ballot',
      //     showInMenu: true,
      //     menuCode: 'HRM_SURVEY',
      //     functionMapping: '/HRM/HRM_TOOLS/HRM_SURVEY'
      //   },
      //   name: 'HrmSurvey',
      //   path: 'survey',
      // },
      {
        component: () => import('@/apps/hrm/views/planning/PlanningList.vue'),
        meta: {
          requiredAuth: true,
          icon: 'move_location',
          showInMenu: true,
          menuCode: 'HRM_REPORT',
          functionMapping: '/HRM/HRM_ORGANIZATION/HRM_ORG_PLANNING'
        },
        name: 'hrmPlanning',
        path: 'planning',
      },
      {
        component: () => import('@/apps/hrm/views/organization/OrganizationTree.vue'),
        meta: {
          requiredAuth: true,
          icon: 'account_tree',
          showInMenu: true,
          menuCode: 'HRM_ORGANIZATION',
          functionMapping: '/HRM/HRM_ORGANIZATION/HRM_ORG_STRUCTURE'
        },
        name: 'HrmOrganization',
        path: 'organization',
      },
      {
        component: () => import('@/apps/hrm/views/request/HrmRequestCreate.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false,
          functionMapping: '/HRM/HRM_CONFIG/HRM_CONFIG_REQUEST'
        },
        name: 'HrmRequestCreate',
        path: 'request/create'
      },
      {
        component: () => import('@/apps/hrm/views/request/HrmRequestUpdate.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false,
        },
        name: 'HrmRequestUpdate',
        path: 'request/update/:id'
      },
      {
        component: () => import('@/apps/hrm/views/request/HrmRequestDetail.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: false,
        },
        name: 'HrmRequestDetail',
        path: 'request/detail/:id'
      },
      {
        component: () => import('@/apps/hrm/views/digitizedFolder/DigitizedFolder.vue'),
        meta: {
          icon: 'folder_shared',
          menuCode: 'HRM_CATEGORY',
          requiredAuth: true,
          showInMenu: true,
          functionMapping: '/HRM/HRM_TOOLS/HRM_DIGITAL_STORAGE'
        },
        name: 'hrmDigitizedFolder',
        path: 'digitized-folder'
      },
      {
        component: () => import('@/apps/hrm/views/report/HrmReport.vue'),
        meta: {
          requiredAuth: true,
          icon: 'analytics',
          showInMenu: true,
          menuCode: 'HRM_REPORT',
          functionMapping: '/HRM/HRM_TOOLS/HRM_REPORT'
        },
        name: 'HrmReport',
        path: 'report',
      },
      {
        component: () =>
          import('@/apps/hrm/views/categories/CategoryManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'list',
          showInMenu: true,
          menuCode: 'HRM_CATEGORY',
          functionMapping: '/HRM/HRM_TOOLS/HRM_CATEGORY'
        },
        name: 'HrmCategory',
        path: 'category',
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          icon: 'settings',
          showInMenu: true,
          menuCode: 'HRM_SETTING',
          functionMapping: '/HRM/HRM_CONFIG'
        },
        name: 'HrmSetting',
        path: 'setting',
        children: [
          {
            component: () => import('@/apps/hrm/views/default_attendance/DefaultAttendance.vue'),
            meta: {
              requiredAuth: true,
              icon: 'in_home_mode',
              showInMenu: true,
              functionMapping: '/HRM/HRM_CONFIG/HRM_CONFIG_CAMERA'
            },
            name: 'HrmDefaultAttendance',
            path: 'default-attendance',
          },
          {
            component: () => import('@/apps/hrm/views/shift/HrmEmployeeShiftManager.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              icon: 'auto_transmission',
              functionMapping: '/HRM/HRM_CONFIG/HRM_CONFIG_SHIFT'
            },
            name: 'HrmEmployeeShiftManager',
            path: 'shift',
          },
          {
            component: () => import('@/apps/hrm/views/request/HrmRequestManage.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              icon: 'other_admission',
              functionMapping: '/HRM/HRM_CONFIG/HRM_CONFIG_REQUEST'
            },
            name: 'HrmRequestManage',
            path: 'request',
          },
          {
            component: () =>
              import('@/apps/hrm/views/salaryAndTax/SalaryAndTaxSetting.vue'),
            meta: {
              requiredAuth: true,
              icon: 'request_quote',
              showInMenu: true,
              menuCode: 'HRM_CATEGORY',
            },
            name: 'hrmSalaryForm',
            path: 'salary-form',
          },

          {
            component: () =>
              import('@/apps/hrm/views/salaryAndTax/payslipInfo/PayslipInfoManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'request_quote',
              showInMenu: true,
              menuCode: 'HRM_CATEGORY',
            },
            name: 'hrmPayslipInfo',
            path: 'payslip-info',
          },
        ]
      },
    ],
  },
];

export default routes;
