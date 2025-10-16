<template>
  <div
    v-for='(comment) in children'
    :key='comment.id'>
    <TaskTreeCommentItem
      :comment='comment'
      @delete='deleteComment(comment)'
      @edit='editComment(comment)'
      @reply='replyComment(comment)'></TaskTreeCommentItem>
  </div>
</template>

<script lang="ts" setup>
import type { TreeNode } from 'primevue/treenode';
import type { PropType } from 'vue';

import type { TaskComment } from '@/apps/work/model/taskComment';
import TaskTreeCommentItem from '@/apps/work/views/task/component/comment/item/TaskTreeCommentItem.vue';

const props = defineProps({
  children: {
    type: Array as PropType<TreeNode[]>,
    default: () => []
  }
});
const emits = defineEmits<{
  (e: 'reply', repliedComment: TaskComment): void
  (e: 'delete', deleteComment: TaskComment): void
  (e: 'edit', editComment: TaskComment): void
}>();

function deleteComment(treeNode: TreeNode) {
  emits('delete', treeNode as TaskComment);
}

function editComment(treeNode: TreeNode) {
  emits('edit', treeNode as TaskComment);
}

function replyComment(treeNode: TreeNode) {
  emits('reply', treeNode as TaskComment);
}
</script>

<style scoped>

</style>