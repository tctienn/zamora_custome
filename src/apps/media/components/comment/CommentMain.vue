<template>
  <div class='flex flex-column gap-2'>
    <span class='font-medium'>
      {{ t('media.comment.comment') }}
    </span>
    <CommentInput
      v-if='isOpeningEditor'
      :media-type='mediaType'
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
    <CommentTileGroup
      v-model:comments='comments'
      class='flex'
      :media-type='mediaType'/>
    <div
      v-if='canLoadMore'
      class='cursor-pointer flex-wrap text-primary'
      @click='fetchMore'>
      {{ t('media.comment.loadMoreComment') }}
    </div>

  </div>
</template>

<script lang='ts' setup>

import { cloneDeep, get } from 'lodash';
import { computed, onMounted, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CommentInput from '@/apps/media/components/comment/CommentInput.vue';
import CommentTileGroup from '@/apps/media/components/comment/CommentTileGroup.vue';
import { replyCommentsByRepliedCommentId } from '@/apps/media/graphql/comment-graphql';
import type { CommentInterface } from '@/apps/media/model/comment';
import { MediaType } from '@/apps/media/model/media';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  objectId: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String as PropType<MediaType>,
    default: MediaType.ANNOUNCEMENT,
    required: true
  }
});
const { t } = useI18n();
const pageable = reactive<Pageable>({
  page: 0,
  size: 10,
  sort: [{
    property: 'created_time',
    direction: Direction.DESC
  }]
});
const comments = ref<CommentInterface[]>([]);
const totalComments = ref(0);
const canLoadMore = computed(() => comments.value.length < totalComments.value);
onMounted(() => {
  getComments();
});

function getComments() {
  replyCommentsByRepliedCommentId(props.objectId, props.mediaType, null, cloneDeep(pageable))
    .onResult((response) => {
      const rs = get(response, 'data.replyCommentsByRepliedCommentId') || [];
      totalComments.value = rs.totalCount || 0;
      comments.value = rs.edges.map((edge: Edge<CommentInterface>) => ({ ...edge.node, }));
    });
}

function fetchMore() {
  if (canLoadMore.value) {
    pageable.page++;
    const query = replyCommentsByRepliedCommentId(props.objectId, props.mediaType, null, cloneDeep(pageable));
    query.onResult((response) => {
      const rs = get(response, 'data.replyCommentsByRepliedCommentId') || [];
      totalComments.value = rs.totalCount || 0;
      comments.value = [...comments.value, ...rs.edges.map((edge: Edge<CommentInterface>) => ({ ...edge.node, }))];
      query.stop();
    });
    query.start();
  }
}

function sentComment(comment: CommentInterface) {
  comments.value.unshift(comment);
}

const isOpeningEditor = ref<boolean>(false);

function toggleEditor() {
  isOpeningEditor.value = !isOpeningEditor.value;
}

</script>

<style scoped>

</style>