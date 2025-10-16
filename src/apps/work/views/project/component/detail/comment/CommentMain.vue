<template>
  <div class='flex flex-column gap-2'>

    <CommentTileGroup
      v-model:comments='comments'
      class='flex'/>
    <div
      v-if='canLoadMore'
      class='cursor-pointer flex-wrap text-primary'
      @click='fetchMore'>
      {{ t('media.comment.loadMoreComment') }}
    </div>
    <span class='font-medium'>
      {{ t('media.comment.comment') }}
    </span>
    <CommentInput
      v-if='isOpeningEditor'
      :object-id='props.objectId'
      @close-editor='toggleEditor'
      @sent-comment='sentComment'>
    </CommentInput>
    <div
      v-else
      class='border-1 border-primary-300 border-round font-italic hover:surface-0 p-3 text-color-secondary text-sm'
      style='cursor: text'
      @click='toggleEditor'>
      {{ t('media.comment.addComment') }}
    </div>
  </div>
</template>

<script lang="ts" setup>

import { cloneDeep } from 'lodash';
import { computed, inject, onMounted, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { MediaType } from '@/apps/media/model/media';
import type { ProjectDiscussionInterface } from '@/apps/work/model/projectDiscussion';
import CommentInput from '@/apps/work/views/project/component/detail/comment/CommentInput.vue';
import CommentTileGroup from '@/apps/work/views/project/component/detail/comment/CommentTileGroup.vue';
import type { Pageable } from '@/common/model/query';

const props = defineProps({
  objectId: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String as PropType<MediaType>,
    default: MediaType.ANNOUNCEMENT,
    required: true
  },
});
const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: 10
});
const replyCommentsByRepliedCommentId = inject('replyCommentsByRepliedCommentId',
  (objectId: string, commentId: string | null, pageable: Pageable) => Promise.resolve({
    content: [] as ProjectDiscussionInterface[],
    totalElements: 0
  })
);
const comments = ref<ProjectDiscussionInterface[]>([]);
const totalComments = ref(0);
const canLoadMore = computed(() => comments.value.length < totalComments.value);
onMounted(() => {
  getComments();
});

function getComments() {
  replyCommentsByRepliedCommentId(props.objectId, null, cloneDeep(pageable))
    .then(({ content, totalElements }) => {
      totalComments.value = totalElements || 0;
      comments.value = content;
    });
}

function fetchMore() {
  if (canLoadMore.value) {
    pageable.page++;
    replyCommentsByRepliedCommentId(props.objectId, null, cloneDeep(pageable))
      .then(({ content, totalElements }) => {
        totalComments.value = totalElements || 0;
        comments.value = [...comments.value, ...content];
      });
  }
}

function sentComment(comment: ProjectDiscussionInterface) {
  comments.value.push(comment);
}

const isOpeningEditor = ref<boolean>(false);

function toggleEditor() {
  isOpeningEditor.value = !isOpeningEditor.value;
}

</script>

<style scoped>

</style>