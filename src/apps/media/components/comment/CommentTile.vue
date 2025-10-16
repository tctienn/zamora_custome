<template>
  <div class='border-1 border-round flex flex-column gap-2 p-2 relative surface-border'>
    <div class='align-items-center flex gap-2'>
      <AppUser
        v-if='!isEditing'
        avatar-size='2rem'
        name-visible
        :user-id='comment.createdBy'/>
      <span
        v-if='!isEditing'
        class='font-light text-sm'>
        {{ diffDuration(comment.createdTime) }}
      </span>
    </div>
    <div>
      <div
        v-if='!isEditing'
        v-sanitize-html='comment.content'
        class='comment-content'>
      </div>
      <CommentInput
        v-else
        :editing-id='comment.id'
        :media-type='mediaType'
        :object-id='comment.objectId'
        :pre-content='comment.content'
        :replied-id='comment.repliedCommentId'
        @close-editor='()=>isEditing=!isEditing'
        @sent-comment='sentEditComment'>
      </CommentInput>
    </div>

    <div
      class='flex gap-3 mt-3'>
      <span
        v-if='comment.count>0 && !isShowReplyComments'
        class='reply text-primary-500 text-sm'
        @click='toggleReplyComments'>
        {{ t('media.comment.showNComment', {number: comment.count}) }}
      </span>
      <span
        v-if='comment.count>0 && isShowReplyComments'
        class='reply text-primary-500 text-sm'
        @click='toggleReplyComments'>{{ t('media.comment.hideComment') }}</span>
      <span
        class='reply text-primary-500 text-sm'
        @click='replyEvent'>
        {{ t('media.comment.reply') }}
      </span>

      <ButtonIcon
        class='p-0'
        icon='more_horiz'
        text
        @click='toggleOperator'></ButtonIcon>
    </div>
    <CommentInput
      v-if='isShowCommentInput'
      ref='commentInputRef'
      :media-type='mediaType'
      :object-id='comment.objectId'
      :replied-id='comment.id'
      @close-editor='() => isShowCommentInput=false'
      @sent-comment='sentComment'>
    </CommentInput>
    <CommentTileGroup
      v-model:comments='replyComments'
      class='ml-2'
      :class='isShowReplyComments?"flex":"hidden"'
      :media-type='mediaType'/>

    <span
      v-if='isShowReplyComments && canLoadMoreReply'
      class='reply'
      @click='loadMoreReply'>
      {{ t('media.comment.showNComment', {number: totalReplyComment - replyComments.length}) }}
    </span>

    <OverlayPanel ref='op'>
      <div class='flex flex-column gap-3'>
        <span
          v-if='comment.createdBy==user.id'
          class='reply text-primary-500 text-sm'
          @click='editCommentEvent'>
          {{ t('common.edit') }}
        </span>
        <span
          v-if='comment.createdBy==user.id'
          class='reply text-primary-500 text-sm'
          @click='deleteCommentEvent'>
          {{ t('common.delete') }}
        </span>
      </div>
    </OverlayPanel>
  </div>
</template>

<script lang='ts' setup>

import { get } from 'lodash';
import { computed, type PropType, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CommentInput from '@/apps/media/components/comment/CommentInput.vue';
import CommentTileGroup from '@/apps/media/components/comment/CommentTileGroup.vue';
import { deleteComment, replyCommentsByRepliedCommentId } from '@/apps/media/graphql/comment-graphql';
import type { CommentInterface } from '@/apps/media/model/comment';
import { MediaType } from '@/apps/media/model/media';
import AppUser from '@/common/components/app/AppUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { confirm } from '@/common/helpers/custom-confirmation-service';
import { diffDuration } from '@/common/helpers/time-util';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const props = defineProps({
  mediaType: {
    type: String as PropType<MediaType>,
    required: true
  }
});
const emits = defineEmits<{
  deletedComment: [id: string],
  deletedReplyComment: [id: string],
  replyComment: [comment: CommentInterface]
}>();
const comment = defineModel<CommentInterface>('comment', { required: true });

const { t } = useI18n();

const isShowCommentInput = ref<boolean>(false);
const isShowReplyComments = ref<boolean>(false);

const pageable = reactive<Pageable>({
  page: 0,
  size: 5,
  sort: [{
    property: 'createdTime',
    direction: Direction.ASC
  }]
});
const totalReplyComment = ref(0);
const replyComments = ref<CommentInterface[]>([]);
const canLoadMoreReply = computed(() => totalReplyComment.value > replyComments.value.length);

const { mutate: deleteCommentMutate } = deleteComment();
const commentInputRef = ref<InstanceType<typeof CommentInput> | null>(null);

function replyEvent() {
  isShowCommentInput.value = !isShowCommentInput.value;
  emits('replyComment', comment.value);
}

function toggleReplyComments() {
  isShowReplyComments.value = !isShowReplyComments.value;
  if (isShowReplyComments.value) {
    if (!replyComments.value.length) {
      getComment();
    }
  }
}

function deleteCommentEvent() {
  confirm({
    message: t('media.comment.confirm.deleteComment'),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteCommentMutate({ id: comment.value?.id }).then(() => {
        emits('deletedComment', comment.value?.id);
      }
      );
    }
  });
}

function sentComment(comment: CommentInterface) {
  isShowReplyComments.value = true;
  replyComments.value.unshift(comment);
}

function getComment() {
  const query = replyCommentsByRepliedCommentId(comment.value.objectId, comment.value.type, comment.value.id, pageable);
  query.onResult((res) => {
    const {
      edges,
      totalCount
    } = get(res, 'data.replyCommentsByRepliedCommentId') || {
      edges: [],
      totalCount: 0
    };
    totalReplyComment.value = totalCount;
    replyComments.value = edges.map((edge: Edge<CommentInterface>) => ({ ...edge.node, })) || [];
    query.stop();
  });
  query.start();
}

function loadMoreReply() {
  if (canLoadMoreReply.value) {
    pageable.page++;
    const query = replyCommentsByRepliedCommentId(comment.value.objectId, comment.value.type, comment.value.id, pageable);
    query.onResult((res) => {
      const {
        edges,
        totalCount
      } = get(res, 'data.replyCommentsByRepliedCommentId') || {
        edges: [],
        totalCount: 0
      };
      totalReplyComment.value = totalCount;
      replyComments.value = [...replyComments.value, ...edges.map((edge: Edge<CommentInterface>) => ({ ...edge.node, })) || []];
      query.stop();
    });
    query.start();
  }
}

const op = ref();

function toggleOperator(event: Event) {
  op.value.toggle(event);
}

const isEditing = ref<boolean>(false);

function editCommentEvent() {
  isEditing.value = true;
}

function sentEditComment(commentVar: CommentInterface) {
  comment.value.content = commentVar.content;
  isEditing.value = false;
}

const { user } = useUserStore();
</script>

<style scoped>
.reply {
  cursor: pointer;
  text-decoration: underline;
}

:deep(.comment-content img) {
  max-width: 100%;
}
</style>