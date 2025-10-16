<template>
  <div class='column-gap-2 flex flex-row'>
    <div class='column-gap-2 flex flex-row'>
      <NewsFeedMain/>

      <div class='flex flex-1 flex-column row-gap-2'>
        <NewsFeedNotification/>
      </div>
    </div>

    <SystemDashboardSidebar :sidebar-widgets='[]'/>
  </div>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';

import SystemDashboardSidebar from '@/common/views/dashboard/component/SystemDashboardSidebar.vue';
import NewsFeedMain from '@/common/views/feed/component/NewsFeedMain.vue';
import NewsFeedNotification from '@/common/views/feed/component/NewsFeedNotification.vue';

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'NewsFeed' };
</script>