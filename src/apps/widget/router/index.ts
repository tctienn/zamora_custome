const routes = [
  {
    component: () => import('@/common/views/AppHome.vue'),
    meta: {
      requiredAuth: true,
      showInMenu: true,
    },
    path: '/widget',
    redirect: '/widget/note',
    children: [
      {
        component: () => import('@/apps/widget/views/note/NoteWidget.vue'),
        meta: {
          requiredAuth: true,
          icon: 'sticky_note',
          menuCode: 'WIDGET_NOTE',
          showInMenu: true,
        },
        name: 'WidgetNote',
        path: 'note',
      },
      {
        component: () => import('@/apps/widget/views/event/EventWidget.vue'),
        meta: {
          requiredAuth: true,
          icon: 'calendar_month',
          menuCode: 'WIDGET_EVENT',
          showInMenu: true,
        },
        name: 'WidgetEvent',
        path: 'event',
      }
    ]
  }
];

export default routes;
