<template>
  <div class='flex flex-column p-2 row-gap-3'>
    <div class=''>
      <InputText
        class='border-none border-round-3xl shadow-none surface-ground w-full'
        placeholder='Viết bình luận...'/>
    </div>

    <div class='flex flex-column row-gap-2'>
      <NewsFeedPostCommentItem
        v-for='comment in range(5)'
        :key='comment'
        :level='comment % 2' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { range } from 'lodash';
import { useI18n } from 'vue-i18n';

import NewsFeedPostCommentItem from '@/common/views/feed/component/post/NewsFeedPostCommentItem.vue';

const { t } = useI18n();

</script>

<script lang='ts'>
export default { name: 'NewsFeedPostComment' };
</script>