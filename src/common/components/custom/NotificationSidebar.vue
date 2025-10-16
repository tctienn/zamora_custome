<template>
  <Sidebar
    v-model:visible='visibleSidebar'
    class='bg-content notifications-sidebar'
    position='right'
    @hide='hide'>

    <template #header>
      <div class=''>
        <h2 class='m-0'>{{ t('common.notification') }}</h2>
      </div>
    </template>

    <div v-if='notificationLoading'>
      Loading
    </div>
    <div
      v-else
      class='notifications'>
      <a
        v-for='(application, index) in notifications'
        :key='index'
        href='/'>
        <div
          class='border-1 border-primary border-round mt-3 notification px-3 py-2'
          :class='application.read ? "read" : "unread bg-white"'>
          <div class='notification-body'>
            <span class='font-bold'>{{ application.title }}</span>
            <span class='mt-1'>{{ application.content }}</span>
          </div>

          <div class='notification-footer text-right'>
            <span class='opacity-50 text-sm'>{{ diffDuration(application.time) }}</span>
          </div>
        </div>
      </a>
    </div>
  </Sidebar>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getNotificationGraphql, markAllAsReadGraphql } from '@/common/api/graphql/notification-graphql-api';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Notification, NotificationEdge } from '@/common/model/notification';
import type { Pageable } from '@/common/model/query';

const props = defineProps<NotificationSidebarProps>();

const { t } = useI18n();

const notificationLoading = ref(true);
const totalNotifications = ref(0);
const notifications = ref<Notification[]>([]);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
});

const {
  onResult: getNotificationResult,
  onError: getNotificationError
} = getNotificationGraphql(pageable);
const {
  mutate: markAsReadMutate,
  onDone: markAsReadDone,
  onError: markAsReadError
} = markAllAsReadGraphql();
let timeout: number;

getNotificationResult((response) => {
  const {
    totalCount,
    edges
  } = get(response, 'data.notifications') || {
    totalCount: 0,
    edges: []
  };
  totalNotifications.value = totalCount;
  notifications.value = edges.map((edge: NotificationEdge) => {
    return edge.node;
  });

  notificationLoading.value = false;

  timeout = window.setTimeout(markAsReadMutate, 1000);
});

getNotificationError((error) => {
  // toastErrorData({ error });
  notificationLoading.value = false;
});

interface NotificationSidebarProps {
  visible: boolean,
  hide: () => void,
  updateCount: (count: number) => void
}

const visibleSidebar = ref(props.visible);

function diffDuration(time: string) {
  const { moment } = useMoment();
  const now = moment();
  const notificationTime = moment(time);
  const duration = moment.duration(notificationTime.diff(now));
  return duration.humanize();
}

markAsReadDone(() => {
  props.updateCount(0);
  timeout && clearTimeout(timeout);
});

markAsReadError(() => {
  timeout && clearTimeout(timeout);
});
</script>

<script lang='ts'>
export default { name: 'NotificationSidebar' };
</script>

<style scoped>

</style>