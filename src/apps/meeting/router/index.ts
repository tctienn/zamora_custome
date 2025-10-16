import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('@/apps/meeting/views/App.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
      menuCode: 'MEETING',
      functionMapping: '/MEETING',
    },
    name: 'meeting',
    path: '/meeting',
    children: [
      {
        meta: {
          requiredAuth: true,
          icon: 'calendar_month',
          showInMenu: true,
          menuCode: 'MEETING_CALENDAR',
          functionMapping:
            '/MEETING/MEETING_CALENDAR/MEETING_CALENDAR_VIEW/VIEW',
        },
        name: 'MeetingCalendar',
        path: 'calendar',
        children: [
          {
            component: () => import('@/apps/meeting/views/MeetingCalendar.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEETING_CALENDAR_VIEW',
            },
            name: 'MeetingCalendarView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'perm_contact_calendar',
          showInMenu: true,
          menuCode: 'MEETING_PERSONAL',
          functionMapping:
            '/MEETING/MEETING_PERSONAL/MEETING_PERSONAL_VIEW/VIEW',
        },
        name: 'MeetingPersonal',
        path: 'personal',
        children: [
          {
            component: () => import('@/apps/meeting/views/MeetingPersonal.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEETING_PERSONAL_VIEW',
            },
            name: 'MeetingPersonalView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'perm_contact_calendar',
          showInMenu: true,
          menuCode: 'MEETING_LEADER',
          functionMapping:
            '/MEETING/MEETING_PERSONAL/MEETING_PERSONAL_VIEW/VIEW',
        },
        name: 'MeetingLeader',
        path: 'leader',
        children: [
          {
            component: () => import('@/apps/meeting/views/MeetingCalendarLeader.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEETING_LEADER_VIEW',
            },
            name: 'MeetingLeaderView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'meeting_room',
          showInMenu: true,
          menuCode: 'MEETING_ROOM',
        },
        name: 'MeetingRoom',
        path: 'room',
        children: [
          {
            component: () => import('@/apps/meeting/views/MeetingRoom.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEETING_ROOM_VIEW',
            },
            name: 'MeetingRoomView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'view_timeline',
          showInMenu: true,
          menuCode: 'MEETING_SUMMARY',
          functionMapping: '/MEETING/MEETING_SUMMARY/MEETING_SUMMARY_VIEW/VIEW',
        },
        name: 'meetingSummary',
        path: 'summary',
        children: [
          {
            component: () =>
              import('@/apps/meeting/views/meeting/MeetingSummary.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEETING_SUMMARY_VIEW',
            },
            name: 'MeetingSummaryView',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'settings',
          showInMenu: true,
        },
        name: 'MeetingManager',
        path: 'manager',
        children: [
          {
            component: () =>
              import('@/apps/meeting/views/manager/MeetingManagerCalendar.vue'),
            meta: { requiredAuth: true, },
            name: 'MeetingManagerCalendar',
            path: '',
          },
        ],
      },
      {
        meta: {
          requiredAuth: true,
          icon: 'settings',
          showInMenu: true,
          menuCode: 'MEETING_MANAGER',
          functionMapping: '/MEETING/MEETING_MANAGER',
        },
        name: 'Manager',
        path: 'manager',
        children: [
          {
            component: () =>
              import('@/apps/meeting/views/manager/MeetingManagerRoom.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEETING_MANAGER_ROOM',
              showInMenu: true,
              icon: 'meeting_room',
              functionMapping:
                '/MEETING/MEETING_MANAGER/MEETING_MANAGER_ROOM/VIEW',
            },
            name: 'MeetingManagerRoom',
            path: 'room',
          },
          {
            component: () =>
              import('@/apps/meeting/views/manager/MediaDeviceManager.vue'),
            meta: {
              requiredAuth: true,
              menuCode: 'MEDIA_DEVICE_MANAGER',
              showInMenu: true,
              icon: 'devices',
            },
            name: 'MediaDeviceManager',
            path: 'media-device',
          },
        ],
      },
    ],
  },
];

export default routes;
