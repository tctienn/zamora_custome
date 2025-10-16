<template>
  <div
    ref='containerComment'
    class='flex flex-column gap-2 mx-3'>
    <div
      v-for='(comment) in treeComment'
      :key='comment.id'
      :ref='el => commentRefs[comment.id] = el'
      class='message'
      :class='{ flash: flashingMessageId === comment.id }'>
      <ProjectTreeCommentItem
        :comment='comment'
        :is-flashing='flashingMessageId === comment.id'
        @delete='deleteComment'
        @edit='editComment'
        @reply='replyComment'></ProjectTreeCommentItem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { get } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getMessage } from '@/apps/work/api/graphql/project-discussion-api';
import { readProjectMessage } from '@/apps/work/api/rest/project-discussion';
import type { ProjectDiscussion } from '@/apps/work/model/projectDiscussion';
import ProjectTreeCommentItem from '@/apps/work/views/project/component/comment/item/ProjectTreeCommentItem.vue';
import EventBus from '@/common/helpers/event-bus';
import { listToTree } from '@/common/helpers/utils';
import type { Connection } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
});
const emits = defineEmits<{
  (e: 'reply', repliedComment: ProjectDiscussion): void
  (e: 'delete', commentId: ProjectDiscussion): void
  (e: 'edit', editComment: ProjectDiscussion): void
}>();

const targetComment = defineModel<ProjectDiscussion | undefined>('targetComment', { default: undefined });
const targetType = defineModel<'reply' | 'edit' | undefined>('targetType', { default: undefined });

const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: 9999999,
  sort: [{
    property: 'createdTime',
    direction: Direction.ASC
  }]
});

const {
  onResult: messageResult,
  load: messageLoad,
  restart: messageRestart,
  refetch: messageRefetch
} = getMessage(props.projectId, pageable);

const treeComment = ref<TreeNode[]>([]);

watch(() => props.projectId, projectId => {
  readProjectMessage(projectId).then(() => {
    const variables = {
      projectId: projectId,
      pageable: pageable
    };
    messageLoad(undefined, variables) || messageRefetch(variables);
  });
}, { immediate: true });

messageResult((res) => {
  const { edges } = get(res, 'data.getMessage', { edges: [] }) as Connection<ProjectDiscussion>;
  const messages = edges.map(e => e.node);
  treeComment.value = listToTree(messages.map(e => ({
    ...e,
    children: []
  })), {
    id: 'id',
    parentId: 'replyId',
    children: 'children'
    //Show ra nhung comment khong cho replyId
  }).filter((e: any) => !e.replyId);
});
messageLoad();

function reload() {
  messageRefetch({
    projectId: props.projectId,
    pageable: pageable
  });
}

function replyComment(repliedComment: ProjectDiscussion) {
  targetType.value = 'reply';
  targetComment.value = repliedComment;
  emits('reply', repliedComment);
}

function deleteComment(deleteComment: ProjectDiscussion) {
  emits('delete', deleteComment);
}

function editComment(editComment: ProjectDiscussion) {
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

<style scoped>
.flash {
  background: var(--surface-200) !important;
}

.message {
  transition: background 2s ease-in-out !important;
}
</style>