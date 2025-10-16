import type { RouteRecordRaw } from 'vue-router';

/**
 * - To config a route not show in menu, set showInMenu: false
 * - To config a route not show in breadcrumb, set showInBreadcrumb: false
 */
const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/media/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'MEDIA',
      functionMapping: '/MEDIA',
    },
    name: 'Media',
    path: '/media',
    children: [
      {
        meta: {
          requiredAuth: true,
          showInMenu: true,
          icon: 'campaign',
          menuCode: 'MEDIA_ANNOUNCEMENT',
          functionMapping: '/MEDIA/MEDIA_ANNOUNCEMENT',
        },
        name: 'MediaAnnouncement',
        path: 'announcement',
        redirect: { name: 'MediaAnnouncementView' },
        children: [
          {
            component: () =>
              import('@/apps/media/views/announcement/AnnouncementPage.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEDIA_ANNOUNCEMENT_VIEW',
              showInBreadcrumb: false,
              functionMapping:
                '/MEDIA/MEDIA_ANNOUNCEMENT/MEDIA_ANNOUNCEMENT_VIEW',
            },
            name: 'MediaAnnouncementView',
            path: '',
          },
          {
            component: () => import('@/apps/media/views/media/MediaView.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              showInBreadcrumb: false,
            },
            name: 'MediaAnnouncementDetail',
            path: 'detail/:id',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          showInMenu: true,
          icon: 'news',
          menuCode: 'MEDIA_NEWS',
          functionMapping: '/MEDIA/MEDIA_NEWS',
        },
        name: 'MediaNews',
        path: 'news',
        redirect: { name: 'MediaNewsView' },
        children: [
          {
            component: () => import('@/apps/media/views/news/NewsPage.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEDIA_NEWS_VIEW',
              showInBreadcrumb: false,
              functionMapping: '/MEDIA/MEDIA_NEWS/MEDIA_NEWS_VIEW',
            },
            name: 'MediaNewsView',
            path: '',
          },
          {
            component: () => import('@/apps/media/views/media/MediaView.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              showInBreadcrumb: false,
            },
            name: 'MediaNewsDetail',
            path: 'detail/:id',
          },
        ],
      },
      {
        meta: {
          requiredAuth: false,
          showInMenu: true,
          icon: 'cake',
          menuCode: 'MEDIA_NEWS',
          functionMapping: '/MEDIA/MEDIA_NEWS',
        },
        name: 'Birthday',
        path: 'birthday',
        redirect: { name: 'Birthday' },
        children: [
          {
            component: () =>
              import('@/apps/media/views/birthday/BirthdayGridView.vue'),
            meta: {
              requiredAuth: false,
              menuCode: 'MEDIA_NEWS_VIEW',
              showInBreadcrumb: false,
              functionMapping: '/MEDIA/MEDIA_NEWS/MEDIA_NEWS_VIEW',
            },
            name: 'BirthdayView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          showInMenu: true,
          icon: 'military_tech',
          menuCode: 'MEDIA_HONORS',
          functionMapping: '/MEDIA/MEDIA_HONORS',
        },
        name: 'MediaHonors',
        path: 'honors',
        redirect: { name: 'MediaHonorsView' },
        children: [
          {
            component: () =>
              import('@/apps/media/views/honor/HonorGridView.vue'),
            meta: {
              requiredAuth: false,
              menuCode: 'MEDIA_HONORS',
              showInBreadcrumb: false,
              functionMapping: '/MEDIA/MEDIA_HONORS',
            },
            name: 'MediaHonorsView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          showInMenu: true,
          icon: 'contact_page',
          menuCode: 'MEDIA_CONTACTS',
        },
        name: 'MediaContacts',
        path: 'contacts',
        children: [
          {
            component: () =>
              import('@/apps/media/views/contacts/ContactsManager.vue'),
            meta: {
              requiredAuth: false,
              menuCode: 'MEDIA_CONTACTS',
              showInBreadcrumb: false,
            },
            name: 'Contacts',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          showInMenu: true,
          icon: 'ballot',
          menuCode: 'MEDIA_SURVEYS',
        },
        name: 'MediaSurveys',
        path: 'survey',
        children: [
          {
            component: () =>
              import('@/apps/media/views/survey/SurveyView.vue'),
            meta: {
              requiredAuth: false,
              menuCode: 'MEDIA_SURVEYS',
              showInBreadcrumb: false,
            },
            name: 'Survey',
            path: '',
          },
        ],
      },
      {
        component: () => import('@/common/components/app/AppIndex.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'MEDIA_CONFIG',
          icon: 'settings',
          isModule: true,
          showInMenu: true,
          functionMapping: '/MEDIA/MEDIA_CONFIG',
        },
        name: 'MediaConfig',
        path: 'config',
        children: [
          {
            component: () =>
              import(
                '@/apps/media/views/survey/SurveyManagement.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'ballot',
              menuCode: 'MEDIA_CONFIG_SURVEYS',
              showInMenu: true,
              functionMapping: '/MEDIA/MEDIA_CONFIG/MEDIA_CONFIG_SURVEYS',
            },
            name: 'MediaConfigSurvey',
            path: 'survey',
          },
          {
            component: () =>
              import(
                '@/apps/media/views/announcement/AnnouncementManagement.vue'
              ),
            meta: {
              requiredAuth: true,
              icon: 'campaign',
              menuCode: 'MEDIA_CONFIG_ANNOUNCEMENT',
              showInMenu: true,
              functionMapping: '/MEDIA/MEDIA_CONFIG/MEDIA_CONFIG_ANNOUNCEMENT',
            },
            name: 'MediaConfigAnnouncement',
            path: 'announcement',
          },
          {
            component: () =>
              import('@/apps/media/views/news/NewsManagement.vue'),
            meta: {
              requiredAuth: true,
              icon: 'newsmode',
              menuCode: 'MEDIA_CONFIG_NEWS',
              showInMenu: true,
              functionMapping: '/MEDIA/MEDIA_CONFIG/MEDIA_CONFIG_NEWS',
            },
            name: 'MediaConfigNews',
            path: 'news',
          },
          {
            component: () =>
              import('@/apps/media/views/media/MediaQuickView.vue'),
            meta: {
              requiredAuth: true,
              showInMenu: false,
              showInBreadcrumb: false,
            },
            name: 'MediaAnnouncementQuickView',
            path: 'announcement/view/:id',
          },
          {
            component: () =>
              import('@/apps/media/views/honor/HonorManagement.vue'),
            meta: {
              requiredAuth: true,
              icon: 'military_tech',
              menuCode: 'MEDIA_CONFIG_HONORS',
              showInMenu: true,
              functionMapping: '/MEDIA/MEDIA_CONFIG/MEDIA_CONFIG_HONORS',
            },
            name: 'MediaConfigHonors',
            path: 'honors',
          },
        ],
      },
    ],
  },
];

export default routes;
