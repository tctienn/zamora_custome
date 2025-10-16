const routes = [
  {
    component: () => import('@/common/views/AppHome.vue'),
    meta: { requiredAuth: true, },
    path: '/chat',
    children: [
      {
        component: () => import('@/apps/chat/views/AppChat.vue'),
        meta: {
          requiredAuth: true,
          menuCode: 'CHAT',
          showInBreadcrumb: false
        },
        name: 'AppChat',
        path: ':conversationId?',
      }
    ]
  }
];

export default routes;
