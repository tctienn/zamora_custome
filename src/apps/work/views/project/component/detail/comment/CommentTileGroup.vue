<template>
  <div
    class='flex-column gap-1'>
    <CommentTile
      v-for='(comment, idx) in comments'
      :key='comment.id'
      v-model:comment='comments[idx]'
      @deleted-comment='deleteComment'>
    </CommentTile>
  </div>
</template>

<script lang="ts" setup>

import type { ProjectDiscussionInterface } from '@/apps/work/model/projectDiscussion';
import CommentTile from '@/apps/work/views/project/component/detail/comment/CommentTile.vue';

const comments = defineModel<ProjectDiscussionInterface[]>('comments', { default: [] });

function deleteComment(id: string) {
  comments.value = comments.value.filter(c => c.id !== id);
}
</script>

<script lang="ts">
export default { name: 'CommentTileGroup' };

</script>

<style scoped>

</style>