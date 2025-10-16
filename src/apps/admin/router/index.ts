import type { RouteRecordRaw } from 'vue-router';

/**
 * - To config a route not show in menu, set showInMenu: false
 * - To config a route not show in breadcrumb, set showInBreadcrumb: false
 */
const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/admin/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'ADMIN',
      functionMapping: '/ADMIN/'
    },
    name: 'Admin',
    path: '/admin',
    children: [
      {
        component: () => import('@/apps/admin/views/dashboard/AdminDashboard.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'ADMIN_CONFIG',
          isModule: true,
          icon: 'dashboard',
        },
        name: 'AdminDashboard',
        path: 'dashboard'
      },

      {
        component: () => import('@/common/views/search/SearchResult.vue'),
        meta: {
          requiredAuth: true,
          icon: 'text_snippet',
          showInMenu: false,
        },
        name: 'AdminSearchResult',
        path: 'search',
      },

      {
        component: () => import('@/apps/admin/views/organization/OrganizationManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'apps',
          showInMenu: true,
          menuCode: 'ADMIN_CONFIG-ORGANIZATION',
          functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ORGANIZATION/'
        },
        name: 'AdminConfigOrganization',
        path: 'organization'
      },

      {
        component: () => import('@/apps/admin/views/user/UserManager.vue'),
        meta: {
          requiredAuth: true,
          icon: 'person',
          showInMenu: true,
          menuCode: 'ADMIN_CONFIG-USER',
          functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/'
        },
        name: 'AdminConfigUser',
        path: 'user'
      },

      {
        component: () => import('@/apps/admin/views/product/ProductTabView.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'ADMIN_PRODUCT',
          isModule: true,
          icon: 'developer_guide',
        },
        name: 'AdminProduct',
        path: 'product'
      },

      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'ADMIN_CONFIG',
          isModule: true,
          icon: 'settings',
          functionMapping: '/ADMIN/ADMIN_CONFIG/'
        },
        name: 'AdminConfig',
        path: 'config',
        children: [
          {
            component: () => import('@/apps/admin/views/role/RoleManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'settings_accessibility',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-ROLE',
              functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ROLE/'
            },
            name: 'AdminConfigRole',
            path: 'role'
          }, {
            component: () => import('@/apps/admin/views/object/ObjectManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'data_object',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-OBJECT',
              functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-OBJECT'
            },
            name: 'AdminConfigObject',
            path: 'object',
          },
          {
            component: () => import('@/apps/admin/views/object/property/PropertyManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'list',
              showInMenu: false,
              functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-OBJECT'
            },
            name: 'objectProperty/VIEW',
            path: 'property'
          },
          {
            component: () => import('@/apps/admin/views/log/LogUser.vue'),
            meta: {
              requiredAuth: true,
              icon: 'text_snippet',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-LOG',
            },
            name: 'AdminConfigLog',
            path: 'log-user'
          },
          {
            component: () => import('@/apps/admin/views/log-auth/LogAuth.vue'),
            meta: {
              requiredAuth: true,
              icon: 'text_snippet',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-LOG-AUTH',
            },
            name: 'AdminConfigLogAuth',
            path: 'log-auth'
          },
          {
            component: () => import('@/apps/admin/views/user-group/UserGroupManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'interests',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-GROUP',
              functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/'
            },
            name: 'AdminConfigGroup',
            path: 'user-group'
          },

          {
            component: () => import('@/apps/admin/views/permissions/RolePermissions.vue'),
            meta: {
              requiredAuth: true,
              icon: 'category',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-PERMISSION',
              functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-PERMISSION/'
            },
            name: 'AdminConfigPermission',
            path: 'permission'
          },
          {
            component: () => import('@/apps/admin/views/sign/SignProvideConfigPage.vue'),
            meta: {
              requiredAuth: true,
              icon: 'ink_pen',
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-SIGN-PROVIDE',
              // functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-PERMISSION/'
            },
            name: 'AdminConfigSignProvide',
            path: 'sign-provide'
          },
          {
            component: () => import('@/apps/admin/views/email-template/EmailTemplateManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'contact_mail',
              showInMenu: true,
              menuCode: 'NOTIFICATION_TEMPLATE',
              functionMapping: '/ADMIN/NOTIFICATION/NOTIFICATION_TEMPLATE/'
            },
            name: 'NotificationTemplate',
            path: 'notificationTemplate'
          },
          {
            component: () => import('@/apps/admin/views/email-configuration/EmailConfigurationManager.vue'),
            meta: {
              requiredAuth: true,
              icon: 'mail',
              showInMenu: true,
              menuCode: 'NOTIFICATION_CONFIG',
              functionMapping: '/ADMIN/NOTIFICATION/NOTIFICATION_CONFIG/'
            },
            name: 'NotificationConfig',
            path: 'notificationConfig'
          }
        ]
      },

      {
        meta: {
          requiredAuth: true,
          icon: 'account_tree',
          showInMenu: true
        },
        name: 'AdminWorkFlowConfig',
        path: 'work-flow',
        redirect: { name: 'AdminWorkFlowConfigListView' },
        children: [
          {
            component: () => import('@/apps/work-flow/views/WorkFlowManager.vue'),
            meta: { requiredAuth: true, },
            name: 'AdminWorkFlowConfigListView',
            path: 'list'
          },
          {
            component: () => import('@/apps/work-flow/views/config/WorkFlowEditor.vue'),
            meta: { requiredAuth: true, },
            name: 'AdminWorkFlowConfigView',
            path: ':flowId',
          },
        ]
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'CATEGORY',
          isModule: true,
          icon: 'list',
          functionMapping: '/ADMIN/CATEGORY/'
        },
        name: 'AdminCategory',
        path: 'category',
        children: [
          {
            component: () => import('@/apps/admin/views/category-group/CategoryGroupManager.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'CATEGORY_CATEGORY-MANAGER',
              isModule: true,
              icon: 'list',
              functionMapping: '/ADMIN/CATEGORY/'
            },
            name: 'AdminCategoryManage',
            path: 'category',
          },
          {
            component: () => import('@/apps/admin/views/positions/PositionManager.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: true,
              menuCode: 'ADMIN_CONFIG-ORGANIZATION',
              functionMapping: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ORGANIZATION/',
              icon: 'Badge'
            },
            name: 'PositionManager',
            path: 'positionManager'
          },
        ]
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          showInMenu: true,
          menuCode: 'ADMIN_BACKUP',
          isModule: true,
          icon: 'cloud_upload',
        },
        name: 'adminBackUp',
        path: 'back-up'
      },
      // {
      //   component: () => import('@/common/components/app/AppIndex.vue'),
      //   meta: {
      //     requiredAuth: true,
      //     showInMenu: true,
      //     menuCode: 'NOTIFICATION',
      //     isModule: true,
      //     icon: 'local_post_office',
      //     functionMapping: '/ADMIN/NOTIFICATION/'
      //   },
      //   name: 'NotificationManage',
      //   path: 'notification',
      //   children: [
      //     {
      //       component: () => import('@/apps/admin/views/email-configuration/EmailConfigurationManager.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         icon: 'interests',
      //         showInMenu: true,
      //         menuCode: 'NOTIFICATION_CONFIG',
      //         functionMapping: '/ADMIN/NOTIFICATION/NOTIFICATION_CONFIG/'
      //       },
      //       name: 'NotificationConfig',
      //       path: 'notificationConfig'
      //     },
      //     {
      //       component: () => import('@/apps/admin/views/email-template/EmailTemplateManager.vue'),
      //       meta: {
      //         requiredAuth: true,
      //         icon: 'category',
      //         showInMenu: true,
      //         menuCode: 'NOTIFICATION_TEMPLATE',
      //         functionMapping: '/ADMIN/NOTIFICATION/NOTIFICATION_TEMPLATE/'
      //       },
      //       name: 'NotificationTemplate',
      //       path: 'notificationTemplate'
      //     }
      //   ]
      // }
    ]
  }
];

export default routes;
