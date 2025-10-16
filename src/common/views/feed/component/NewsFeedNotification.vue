<template>
  <div class='border-1 border-round-2xl p-2 shadow-1 surface-border'>
    <div class='align-items-center column-gap-2 flex flex-row'>
      <AppIcon
        color='var(--green-500)'
        name='campaign'
        size='3' />
      <span class='font-bold text-3xl'>Thông báo</span>
    </div>

    <Divider class='my-2' />

    <div class='flex flex-column row-gap-2'>
      <NewsFeedNotificationItem
        v-for='notification in range(3)'
        :key='notification' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { range } from 'lodash';
import { useI18n } from 'vue-i18n';

import NewsFeedNotificationItem from '@/common/views/feed/component/notification/NewsFeedNotificationItem.vue';

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'NewsFeedNotification' };
</script>