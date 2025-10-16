<template>
  <div
    class='flex-column gap-1'>
    <CommentTile
      v-for='(comment, idx) in comments'
      :key='comment.id'
      v-model:comment='comments[idx]'
      :media-type='mediaType'
      @deleted-comment='deleteComment'>
    </CommentTile>
  </div>
</template>

<script setup lang="ts">

import type { PropType } from 'vue';

import CommentTile from '@/apps/media/components/comment/CommentTile.vue';
import type { CommentInterface } from '@/apps/media/model/comment';
import { MediaType } from '@/apps/media/model/media';

const props = defineProps({
  mediaType: {
    type: String as PropType<MediaType>,
    required: true
  }
});
const comments = defineModel<CommentInterface[]>('comments', { default: [] });

function deleteComment(id: string) {
  comments.value = comments.value.filter(c => c.id !== id);
}
</script>

<style scoped>

</style>