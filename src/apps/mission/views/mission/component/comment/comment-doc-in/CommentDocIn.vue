<template>
  <CommentDocInSupport
    ref='commentDocInSupportRef'
    :content-style='contentStyle'
    :job-id='jobId'/>

</template>

<script lang='ts' setup>

import { computed, provide, ref } from 'vue';

import { delComment, editComment, replyComment } from '@/apps/document/api/rest/comment';
import { createFormCommentDocIn } from '@/apps/mission/helpers/comment-utils';

import CommentDocInSupport from './CommentDocInSupport.vue';

const props = defineProps({
  jobId: {
    type: String,
    default: undefined
  },
  contentStyle: {
    type: Object,
    default: () => ({ maxHeight: 'calc(100vh - 26rem)' })
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const commentDocInSupportRef = ref<InstanceType<typeof CommentDocInSupport> | null>(null);

function loadComments() {
  commentDocInSupportRef.value?.loadComments();
}

provide('deleteMessage', delComment);
provide('sendEditMessage', editComment);
provide('sendReplyMessage', replyComment);
provide('contentStyle', props.contentStyle);
defineExpose({ loadComments });
provide('createFormComment', createFormCommentDocIn);

const disableComputed = computed(() => props.disabled);
provide('disabled', disableComputed);
</script>

<style scoped>

</style>
