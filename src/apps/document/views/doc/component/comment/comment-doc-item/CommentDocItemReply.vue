<template>
  <template
    v-if='comment?.replyComment?.length|| -1 > 0'>
    <CommentDocItem
      v-for='c in comment?.replyComment'
      :key='c.id'
      :comment='c'/>
  </template>

</template>

<script lang="ts" setup>
import { type PropType } from 'vue';

import type { DocComment } from '@/apps/document/model/comment';
import CommentDocItem from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItem.vue';

defineProps({
  comment: {
    type: Object as PropType<DocComment>,
    default: undefined
  },
});

</script>

<style scoped>

</style>