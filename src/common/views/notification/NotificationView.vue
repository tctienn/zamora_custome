<template>

  <div class='col-12 mx-auto p-0 xl:col-8'>
    <h4>{{ t('common.notification') }}</h4>
    <div class='relative'>
      <TabMenu
        :model='tabs'
        @tab-change='changeTab'>
      </TabMenu>
      <AppIcon
        class='absolute cursor-pointer text-primary'
        name='more_horiz'
        size='1.5'
        style='top:25%; right: 1rem;'
        @click='showTopMenu'/>
    </div>

  </div>

  <DataView
    class='col-12 mx-auto overflow-x-hidden overflow-y-auto p-0 xl:col-8'
    data-key='node'
    layout='list'
    :style='`max-height: ${viewHeight}`'
    :value='filterNotifications'
    @scrollend='scroll'>
    <template #empty>
      <div class='font-semibold p-4 text-center'>
        {{ $t('common.emptyRecords', { itemType: $t('common.notification') }) }}
      </div>
    </template>
    <template #list='{items}'>
      <template
        v-for='(item, index) in items'
        :key='index'>
        <div
          class='align-items-center cursor-pointer flex gap-3 hover:bg-black-alpha-10 notification-wrapper p-3'
          :class='{"selected-notification": selectedNotification?.id === item.id}'
          @click='selectedNotification = item'
          @dblclick='goToPage($router, item)'>
          <AppUser
            avatar-size='2.5'
            :user-id='item.fromUserId'/>
          <div class='flex flex-column flex-grow-1 gap-2'>
            <div
              class='font-semibold notification-title text-lg'
              :class='item.read ? "read text-color" : "text-primary"'>{{ item.title }}
            </div>
            <div>
              <div class='notification-content'>{{ item.content }}</div>
              <div class='flex-grow-0 text-primary-300 text-sm'>{{ diffDuration(item.time) }}</div>
            </div>

          </div>
          <Chip
            class='font-semibold px-2 py-1 white-space-nowrap'
            :class='getChipColorClass(item.module)'>{{ t('system.menu.' + camelcase(item.module)) }}
          </Chip>
          <ButtonIcon
            icon='more_horiz'
            icon-size='1.5'
            rounded
            text
            @click='showItemMenu($event, item)'/>
        </div>
      </template>
    </template>
  </DataView>
  <Menu
    ref='menu'
    :model='menuItems'
    :popup='true'/>
</template>

<script setup lang='ts'>
import camelcase from 'camelcase';
import type { MenuItem } from 'primevue/menuitem';
import type { TabMenuChangeEvent } from 'primevue/tabmenu';
import { computed, type ComputedRef, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteNotificationGraphql,
  getNotificationGraphql,
  markAllAsReadGraphql,
  markAsRead
} from '@/common/api/graphql/notification-graphql-api';
import { DEFAULT_PAGE_SIZE } from '@/common/constants';
import { getChipColorClass } from '@/common/helpers/color-util';
import type { Notification, NotificationEdge } from '@/common/model/notification';
import type { Pageable } from '@/common/model/query';
import { goToPage } from '@/common/views/notification/go-to-page';

import { diffDuration } from '../../helpers/time-util';

const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
});
const tabs = [
  {
    label: t('common.all'),
    unread: false,
  },
  {
    label: t('notification.unread'),
    unread: true
  },
];
const menuItems = ref<MenuItem[]>();
const menu = ref();
const unread = ref(tabs[0].unread);
const {
  onResult,
  variables,
  load
} = getNotificationGraphql(pageable);

onResult((response) => {
  notifications.value = [
    ...notifications.value,
    ...response.data['notifications']['edges'].map((edge: NotificationEdge) => edge.node)
  ];
  total.value = response.data['notifications']['totalCount'];
});

const total = ref(0);
const notifications = ref<Notification[]>([]);
const selectedNotification = ref<Notification>();
const viewHeight = ref(calculateHeight());
window.onresize = () => viewHeight.value = calculateHeight();

const filterNotifications: ComputedRef<Notification[]> = computed(() => {
  return notifications.value
    .filter((notification: Notification) => !unread.value || !notification.read);
});

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
}

function readAllNotifications() {
  markAllAsReadGraphql().mutate().then(() => {
    reload();
  });
}

function deleteNotification(notification: Notification) {
  deleteNotificationGraphql().mutate({ id: notification.id }).then(() => {
    notifications.value = notifications.value.filter((n) => n.id !== notification.id);
  });
}

function reload() {
  pageable.page = 0;
  notifications.value = [];
  variables.value = { pageable };
}

function changeTab(e: TabMenuChangeEvent) {
  unread.value = tabs[e.index].unread;
}

function calculateHeight() {
  const height = window.innerHeight - 180;
  return `${height}px`;
}

function moreNotifications() {
  if (notifications.value.length >= total.value) {
    return;
  }
  pageable.page++;
  variables.value = { pageable };
}

function scroll(e: Event) {
  e.target instanceof HTMLElement && e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight && moreNotifications();
}

function showTopMenu(e: Event) {
  menuItems.value = [{
    label: t('notification.markAllAsRead'),
    icon: 'pi pi-check',
    command: readAllNotifications
  },];
  menu.value?.toggle(e);
}

function showItemMenu(e: Event, item: Notification) {
  menuItems.value = [
    {
      label: t('notification.markAsRead'),
      icon: 'pi pi-check',
      disabled() {
        return item.read;
      },
      command() {
        readNotification(item);
      },
    },
    {
      label: t('common.remove'),
      icon: 'pi pi-trash',
      command() {
        deleteNotification(item);
      },
    }
  ];
  menu.value?.toggle(e);
}

onMounted(() => {
  load();
});
</script>

<style scoped>

.selected-notification {
  background-color: var(--highlight-bg);
}

.notification-wrapper {

  .notification-title {
    position: relative;

    &:not(.read) {
      &:after {
        position: absolute;
        right: 1rem;
        top: 0;
        content: '';
        display: inline-block;
        height: 0.5rem;
        width: 0.5rem;
        border-radius: 50%;
        background-color: var(--primary-color);
      }
    }

  }

  .notification-content {
    white-space: break-spaces;
  }
}

</style>
