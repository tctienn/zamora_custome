<template>
  <div class='flex flex-1 flex-column row-gap-2'>
    <NewsFeedPostInput />

    <div class='flex flex-column row-gap-2'>
      <NewsFeedPost
        v-for='post in range(5)'
        :key='post'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { range } from 'lodash';
import { useI18n } from 'vue-i18n';

import NewsFeedPost from '@/common/views/feed/component/post/NewsFeedPost.vue';
import NewsFeedPostInput from '@/common/views/feed/component/post/NewsFeedPostInput.vue';

const { t } = useI18n();
</script>

<script lang='ts'>
export default { name: 'NewsFeedMain' };
</script>