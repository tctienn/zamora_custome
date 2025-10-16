<template>
  <OverlayPanel
    ref='op'
    @show='reload'>
    <div class='align-items-center flex justify-content-between'>
      <div class='font-bold text-xl'>
        {{ t('common.notification') }}

      </div>
      <Button
        class='p-button-sm p-button-text'
        icon='pi pi-ellipsis-h'
        @click='nMenu?.toggle($event)'/>
      <Menu
        ref='nMenu'
        :model='notifyMenu'
        popup/>

    </div>
    <Divider class='my-1 py-1'/>
    <div class='notifications w-25rem'>
      <TabMenu
        :active-index='activeIndex'
        :model='notifyTabs'>
      </TabMenu>
      <div v-if='notificationLoading'>
        Loading
      </div>
      <div
        v-else-if='filterNotifications.length'
        class='flex flex-column gap-2 max-h-30rem overflow-auto'
        @scrollend='scroll'>
        <a
          v-for='(application, index) in filterNotifications'
          :key='index'
          @click='readNotification(application)'>
          <div
            class='border-round cursor-pointer flex gap-2 notification-wrapper p-3 transition-delay-100 transition-duration-300'
            :class='application.read ? "read" : "unread"'>
            <AppUser
              avatar-size='2.5'
              :user-id='application.fromUserId'/>

            <div class='flex flex-column gap-1 w-full'>
              <div
                class='font-bold notification-header'
                :class='application.read ? "text-color": "text-primary"'>{{ application.title }}
              </div>
              <div class='mt-1 notification-body'>{{ application.content }}</div>

              <div class='flex justify-content-between'>
                <Chip
                  class='font-semibold px-2 py-1 text-sm'
                  :class='application.module ? getChipColorClass(application.module) : ""'>
                  {{ t('system.menu.' + camelcase(application.module)) }}
                </Chip>
                <span class='text-primary-300 text-sm'>{{ diffDuration(application.time) }}</span>
              </div>
            </div>
          </div>
        </a>
      </div>
      <div
        v-else
        class='p-4'>
        {{ t('common.emptyRecords', { itemType: t('common.notification') }) }}
      </div>
    </div>

    <Divider class='my-1 py-1'/>
    <div
      class='cursor-pointer flex font-bold justify-content-end text-primary text-sm'
      @click='viewAll'>{{ t('common.viewAll') }}
    </div>
  </OverlayPanel>
</template>

<script setup lang='ts'>

import camelcase from 'camelcase';
import { get } from 'lodash';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import OverlayPanel from 'primevue/overlaypanel';
import { computed, nextTick, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import {
  getNotificationGraphql,
  markAllAsReadGraphql,
  markAsRead
} from '@/common/api/graphql/notification-graphql-api';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { getChipColorClass } from '@/common/helpers/color-util';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import type { Notification, NotificationEdge } from '@/common/model/notification';
import type { Pageable } from '@/common/model/query';
import { goToPage } from '@/common/views/notification/go-to-page';

import { diffDuration } from '../../helpers/time-util';

const { t } = useI18n();
const router = useRouter();

const op = ref<InstanceType<typeof OverlayPanel>>();
const nMenu = ref<InstanceType<typeof Menu>>();
const notificationLoading = ref(true);
const totalNotifications = ref(0);
const notifications = ref<Notification[]>([]);
const notificationMode = ref<'all' | 'unread'>('all');
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
});
const notifyTabs: MenuItem[] = [
  {
    label: t('common.all'),
    code: 'all',
    command: () => changeNotificationMode('all')
  },
  {
    label: t('notification.unread'),
    code: 'unread',
    command: () => changeNotificationMode('unread')
  },
];

const notifyMenu: MenuItem[] = [
  {
    label: t('notification.markAllAsRead'),
    command(event) {
      markAllAsReadGraphql().mutate().then(() => {
        notifications.value = notifications.value.map(
          notification => ({
            ...notification,
            read: true
          }));
        notificationMode.value = 'all';
        nMenu.value?.hide();
      });
    },
  }
];

const filterNotifications = computed((): Notification[] => {
  return notifications.value.filter((notification) => {
    return notificationMode.value === 'all' || !notification.read;
  });
});
const activeIndex = computed(() => notifyTabs.findIndex((menu) => menu.code === notificationMode.value));

const {
  onResult: getNotificationResult,
  onError: getNotificationError,
  refetch,
  load
} = getNotificationGraphql(pageable);

getNotificationResult((response) => {
  const {
    totalCount,
    edges
  } = get(response, 'data.notifications') || {
    totalCount: 0,
    edges: []
  };
  totalNotifications.value = totalCount;
  notifications.value = [
    ...notifications.value,
    ...edges.map((edge: NotificationEdge) => edge.node).filter((n: Notification) => notifications.value.findIndex(n1 => n1.id === n.id) === -1)
  ];

  notificationLoading.value = false;
});

getNotificationError((error) => {
  toastErrorData({ error });
  notificationLoading.value = false;
});

function reload() {
  pageable.page = 0;
  notifications.value = [];
  notificationLoading.value = true;
  load() || refetch();
}

function readNotification(notification: Notification) {
  if (!notification.read) {
    markAsRead().mutate({ id: notification.id }).then(() => {
      notifications.value = notifications.value.map((n) => {
        if (n.id === notification.id) {
          return {
            ...n,
            read: true
          };
        }
        return n;
      });
    });
  }

  goToPage(router, notification);
}

function togglePopup(e: Event) {
  // refetch();
  op.value?.toggle(e);
  nextTick(() => correctNotificationPopup(e));
  // setTimeout(() => correctNotificationPopup(e), 50);
}

function correctNotificationPopup(e: Event) {
  const popup = document.querySelector('.p-overlaypanel') as HTMLElement;
  if (popup) {
    const target = e.target as HTMLElement;
    const centerOfTarget = window.innerWidth - target.getBoundingClientRect().right + target.getBoundingClientRect().width / 2;
    const width = popup.getBoundingClientRect().width;
    popup.style.setProperty('right', '15px');
    popup.style.removeProperty('left');
    popup.style.setProperty('--overlayArrowLeft', `${ width - centerOfTarget }px`);
  }
}

function changeNotificationMode(mode: 'all' | 'unread') {
  notificationMode.value = mode;
}

function moreNotifications() {
  if (notifications.value.length >= totalNotifications.value) {
    return;
  }
  pageable.page++;
  refetch();
}

function scroll(e: Event) {
  e.target instanceof HTMLElement && e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight && moreNotifications();
}

function viewAll() {
  router.push('/notification');
  op.value?.hide();
}

defineExpose({ togglePopup });
</script>

<style scoped>
:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: .5rem;
}

.notifications {
  margin: 0 -1rem;

  .p-tabmenu {
    padding: 0 1rem;

    .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link {
      padding: .5rem;
    }
  }

  .notification-wrapper {
    &.unread {
      position: relative;

      .notification-header {
        &:after {
          content: '•';
          position: absolute;
          right: .5rem;
        }
      }
    }

    &:hover {
      background-color: var(--surface-hover);
    }

    .notification-body {
      white-space: break-spaces;
    }
  }
}

</style>
