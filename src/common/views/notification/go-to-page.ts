import type { Router } from 'vue-router';

import { DOCUMENT_CLIENT_ID, MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Notification } from '@/common/model/notification';

export async function goToPage(router: Router, notification: Notification) {
  switch (notification.module) {
  case DOCUMENT_CLIENT_ID.toUpperCase():
    await router.push('/document');
    break;
  case MISSION_CLIENT_ID.toUpperCase():
    await router.push('/mission');
    break;
  default:
    return;
  }
}
