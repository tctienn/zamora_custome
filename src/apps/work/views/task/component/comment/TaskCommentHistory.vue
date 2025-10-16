<template>
  <div>
    <div
      ref='containerComment'
      class='flex flex-column gap-2'>
      <div
        v-for='(comment) in treeComment'
        :key='comment.id'
        :ref='el => commentRefs[comment.id] = el'
        class='message'
        :class='{ flash: flashingMessageId === comment.id }'>
        <TaskTreeCommentItem
          :comment='comment'
          :is-flashing='flashingMessageId === comment.id'
          @delete='deleteComment'
          @edit='editComment'
          @reply='replyComment'></TaskTreeCommentItem>
      </div>
    </div>
  </div>

  <!--  <div class='flex flex-column gap-2'>-->
  <!--    <div-->
  <!--      v-for='(comment) in taskComments'-->
  <!--      :key='comment.id'>-->
  <!--      <TaskCommentItem-->
  <!--        :comment='comment'-->
  <!--        @delete='deleteComment'-->
  <!--        @edit='editComment'-->
  <!--        @reply='replyComment'></TaskCommentItem>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findCommentsGraphql } from '@/apps/work/api/graphql/comment-api';
import { readTaskComment } from '@/apps/work/api/rest/task-comment';
import type { TaskComment } from '@/apps/work/model/taskComment';
import TaskTreeCommentItem from '@/apps/work/views/task/component/comment/item/TaskTreeCommentItem.vue';
import EventBus from '@/common/helpers/event-bus';
import { listToTree } from '@/common/helpers/utils';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});
const emits = defineEmits<{
  (e: 'reply', repliedComment: TaskComment): void
  (e: 'delete', commentId: TaskComment): void
  (e: 'edit', editComment: TaskComment): void
}>();

const targetComment = defineModel<TaskComment | undefined>('targetComment', { default: undefined });
const targetType = defineModel<'reply' | 'edit' | undefined>('targetType', { default: undefined });

const { t } = useI18n();
const taskComments = ref<TaskComment[]>([]);
const pageable = reactive<Pageable>({
  page: 0,
  size: 9999999,
  sort: [{
    property: 'createdTime',
    direction: Direction.ASC
  }]
});
const {
  onResult: commentOnResult,
  refetch: commentRefetch,
  load: loadComments
} = findCommentsGraphql('TASK', props.taskId || '', undefined, pageable);

readTaskComment(props.taskId || '').then(() => {
  loadComments();
});
const treeComment = ref<TreeNode[]>([]);
commentOnResult(res => {
  taskComments.value = res.data?.findComments?.edges.map((e: Edge<TaskComment>) => {
    return e.node;
  });
  treeComment.value = listToTree(taskComments.value.map(e => ({
    ...e,
    children: []
  })), {
    id: 'id',
    parentId: 'replyId',
    children: 'children'
  }).filter((e: any) => !e.replyId);
});

function reload() {
  commentRefetch({
    type: 'TASK',
    objectId: props.taskId || '',
    replyId: undefined,
    pageable: pageable
  });
}

function replyComment(repliedComment: TaskComment) {
  targetType.value = 'reply';
  targetComment.value = repliedComment;
  emits('reply', repliedComment);
}

function deleteComment(deleteComment: TaskComment) {
  emits('delete', deleteComment);
}

function editComment(editComment: TaskComment) {
  targetType.value = 'edit';
  targetComment.value = editComment;
  emits('edit', editComment);
}

const containerComment = ref<InstanceType<typeof HTMLDivElement> | null>(null);
watch(() => treeComment.value.length, (value, oldValue) => {
  if (value > oldValue) {
    scrollToEnd();
  }
});

function scrollToEnd() {
  nextTick(() => {
    const element = containerComment.value;
    element?.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth', // Enables the sliding effect
    });
  });
}

const flashingMessageId = ref<string>();
const commentRefs = reactive<Record<string, any>>({});
const scrollToComment = (id: string) => {
  nextTick(() => {
    const commentElement = commentRefs[id];
    if (commentElement) {
      commentElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }).then(() => {
    flashingMessageId.value = id;
    setTimeout(() => {
      flashingMessageId.value = undefined;
    }, 2000);
  });
};

onMounted(() => {
  EventBus.on('scrollToCommentId', scrollToComment);
});

onUnmounted(() => {
  EventBus.off('scrollToCommentId', scrollToComment);
});
defineExpose({
  reload,
  scrollToCommentId: scrollToComment
});
</script>

<style lang="css" scoped>
.flash {
  background: var(--surface-200) !important;
}

.message {
  transition: background 2s ease-in-out !important;
}
</style>