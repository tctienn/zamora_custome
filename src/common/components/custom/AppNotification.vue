<template>
  <div
    v-tooltip.bottom='t("common.notification")'
    class='cursor-pointer notification-bell'
    @click='togglePopup'>
    <AppIcon
      v-if='notificationCount'
      v-badge.danger='notificationCount > UNREAD_NOTIFICATION ? `${ UNREAD_NOTIFICATION }+` : notificationCount'
      class='text-white'
      name='notifications_active'
      size='2'/>
    <AppIcon
      v-else
      class='text-white'
      name='notifications'
      size='2'/>
  </div>
  <NotificationToast/>

  <NotificationPopup ref='pop'/>

</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { SSE, type SSEOptions, type SSEvent } from 'sse.js';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { NOTIFICATION_URL } from '@/common/api/configService';
import NotificationToast from '@/common/components/custom/NotificationToast.vue';
import { UNREAD_NOTIFICATION } from '@/common/constants';
import { useUserStore } from '@/common/store/user';
import NotificationPopup from '@/common/views/notification/NotificationPopup.vue';

const notificationCount = ref(0);
const { authentication, user } = storeToRefs(useUserStore());
const { t } = useI18n();
const toast = useToast();
const pop = ref<InstanceType<typeof NotificationPopup>>();
let eventSource: SSE | null = null;

watch(user, (value) => {
  if (eventSource) {
    eventSource.removeEventListener('push-notification', onNotification);
    eventSource = null;
    if (value) {
      registerNotification();
    }
  }
});

onMounted(() => {
  registerNotification();
});

function togglePopup(e: Event) {
  pop.value?.togglePopup(e);
}

function registerNotification() {
  const eventSourceInitDict: SSEOptions = {
    headers: {
      'Authorization': authentication.value,
      'Access-Control-Allow-Origin': '*'
    }
  };
  const connect = () => {
    eventSource = new SSE(NOTIFICATION_URL, eventSourceInitDict);
    eventSource.onerror = (error: SSEvent) => {
      eventSource?.close();
    };
    eventSource.addEventListener('push-notification', onNotification);
  };

  connect();
  let reconnecting = false;
  setInterval(() => {
    if (eventSource?.readyState == EventSource.CLOSED) {
      reconnecting = true;
      connect();
    } else if (reconnecting) {
      reconnecting = false;
    }
  }, 5 * 60 * 1000);

}

function onNotification(e: any) {
  let { data } = e || { data: '{}' };
  data = JSON.parse(data);
  if (data) {
    if (data['unreadNotifications']) {
      const unread = data['unreadNotifications'];
      notificationCount.value = Number(unread);
    }

    if (data['notifications']) {
      (data['notifications'] || []).forEach((notification: object) => {
        toast.add({
          severity: 'info',
          detail: notification,
          life: 10000,
          group: 'notification',
        });
      });
    }
  }
}

onUnmounted(() => {
  eventSource?.removeEventListener('push-notification', onNotification);
  eventSource?.close();
  eventSource = null;
});

</script>

<style scoped>

</style>
