<template>
  <div class='flex flex-column h-full overflow-hidden row-gap-3'>
    <div class='flex flex-column'>
      <span class='font-bold'>{{ `# ${topic.name}` }}</span>
      <small
        class='font-italic word-break-break-word'>{{
        ` (${t("ecm.group.topicWidget.createdBy", {creator: topic.creator})}, ${convertReadableDate(topic.createdAt as
          Date)})`
      }}</small>
    </div>

    <div
      v-if='comments.length'
      class='border-round flex flex-column h-full overflow-y-auto p-3 row-gap-3 surface-100 topic-comment-wrapper'
      @scroll='onScroll'>
      <div
        v-for='comment in comments'
        :key='comment.id'
        class='align-items-start flex flex-column gap-2 md:flex-row'>
        <AppAvatar
          :avatar='generateAvatarUrl(`${comment.avatar}`)'
          :label='comment.sender'
          size='2rem'/>
        <div class='flex-grow-1'>
          <div class='align-items-center flex flex-row flex-wrap justify-content-between'>
            <span class='font-bold'>{{ comment.sender }}</span>
            <small class='font-italic opacity-80'>{{ moment(comment.sentAt).fromNow() }}</small>
          </div>
          <span class='word-break-break-word'>
            {{ comment.content }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-else
      class='flex flex-row justify-content-center w-full'>
      <span>{{ t("ecm.group.topicWidget.noComments") }}</span>
    </div>
    <div
      v-if='!topic.isDeleted && viewOnly'
      class='border-1 border-left-3 border-round relative'
      :class='v$Comment.commentContent.$errors.length ? "border-red-500" : "border-primary"'>
      <Textarea
        v-model='commentContent'
        auto-resize
        class='border-none border-noround outline-none resize-none shadow-none w-full'
        @keydown.enter.prevent='addComment'></Textarea>

      <ButtonIcon
        v-tooltip='t("ecm.group.topicWidget.addComment")'
        class='absolute'
        icon='send'
        style='bottom: .25rem; right: .25rem'
        text
        @click='addComment'/>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { assign, cloneDeep, get, map } from 'lodash';
import { type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getTopicCommentsGraphql } from '@/common/api/graphql/topic-graphql';
import { DEFAULT_CHAT_LOAD_MESSAGE_SIZE, DEFAULT_PAGE_SIZE } from '@/common/constants';
import EventBus from '@/common/helpers/event-bus';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { convertReadableDate } from '@/common/helpers/utils';
import type { GroupTopic, GroupTopicComment } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  topic: {
    type: Object as PropType<GroupTopic>,
    default: {} as GroupTopic
  },
  viewOnly: {
    type: Boolean,
    default: true
  },
});
const { t } = useI18n();
const { moment } = useMoment();
const commentContent = ref('');
const comments = ref<GroupTopicComment[]>([]);
const totalComment = ref(0);
const loadedComment = ref(0);
const manualAddComment = ref(0);

const validateCommentRules = { commentContent: { required } };
const v$Comment = useVuelidate(validateCommentRules, { commentContent }, { $scope: false });

const pageable = reactive<Pageable>({
  page: 0,
  size: props.viewOnly ? 3 : DEFAULT_CHAT_LOAD_MESSAGE_SIZE,
  sort: [{
    property: 'sentAt',
    direction: Direction.DESC
  }]
});

watch(() => props.topic, () => {
  if (props.topic) {
    loadComment();
  }
});

const {
  load: getTopicCommentsLoad,
  onResult: getTopicCommentsResult,
  onError: getTopicCommentsError
} = getTopicCommentsGraphql({
  topicId: props.topic.id as string,
  pageable
});

loadComment();

getTopicCommentsResult((response) => {
  const clonedResponseComments = cloneDeep(comments.value);

  const { totalCount, edges } = get(response, 'data.topicComments', {
    totalCount: 0,
    edges: []
  });
  loadedComment.value += edges.length;
  totalComment.value = totalCount;
  manualAddComment.value = 0;
  clonedResponseComments.push(...map(edges, 'node'));
  comments.value = clonedResponseComments;
  loadingMore.value = false;
});

getTopicCommentsError(() => {
  loadingMore.value = false;
});

function loadComment() {
  assign(pageable, {
    page: 0,
    size: DEFAULT_PAGE_SIZE
  });

  getTopicCommentsLoad(undefined, {
    topicId: props.topic.id as string,
    pageable
  });
}

function addComment(event: KeyboardEvent) {
  if (event.shiftKey && event.code === 'Enter' && commentContent.value) {
    commentContent.value += '\n';
  } else {
    v$Comment.value.$validate().then((isValid) => {
      if (isValid) {
        EventBus.emit('send-topic-comment', { content: commentContent.value });
      }
    });
  }
}

const loadingMore = ref(false);
const onScroll = () => {
  const layoutContentWrapperElement = document.getElementsByClassName('topic-comment-wrapper')[0];

  if (layoutContentWrapperElement) {
    const offsetHeight = layoutContentWrapperElement.scrollHeight - layoutContentWrapperElement.clientHeight;
    const scrollTop = layoutContentWrapperElement.scrollTop;

    // if offsetHeight === scrollTop => scrolled end
    if (offsetHeight - offsetHeight * 0.1 <= scrollTop && !loadingMore.value && loadedComment.value < totalComment.value) {
      loadingMore.value = true;
      assign(pageable, {
        page: pageable.page + 1,
        size: manualAddComment.value ? loadedComment.value : DEFAULT_PAGE_SIZE
      });
      loadComment();
    }
  }
};

function resetState() {
  loadedComment.value = 0;
  totalComment.value = 0;
  manualAddComment.value = 0;
  comments.value = [];

  assign(pageable, {
    page: 0,
    size: DEFAULT_PAGE_SIZE
  });
}

function clearCommentContent() {
  commentContent.value = '';
  v$Comment.value.$reset();
}

defineExpose({
  comments,
  loadedComment,
  totalComment,
  manualAddComment,
  resetState,
  clearCommentContent
});

</script>

<script lang='ts'>
export default { name: 'EcmGroupTopicComment' };
</script>