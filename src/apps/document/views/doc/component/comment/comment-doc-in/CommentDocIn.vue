<template>
  <CommentDocInLeader
    v-if='userDeptRole.roleId==RoleType.LANH_DAO'
    ref='commentDocInLeaderRef'
    :content-style='contentStyle'
    :doc-id='docId'/>
  <CommentDocInSupport
    v-else
    ref='commentDocInSupportRef'
    :content-style='contentStyle'
    :doc-id='docId'/>

</template>

<script lang='ts' setup>

import { computed, provide, ref } from 'vue';

import { delComment, editComment, replyComment } from '@/apps/document/api/rest/comment';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocInLeader from '@/apps/document/views/doc/component/comment/comment-doc-in/CommentDocInLeader.vue';
import CommentDocInSupport from '@/apps/document/views/doc/component/comment/comment-doc-in/CommentDocInSupport.vue';
import { createFormCommentDocIn } from '@/apps/document/views/doc/component/comment/comment-utils';

const props = defineProps({
  docId: {
    type: String,
    required: true
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
const { userDeptRole } = useDocumentRolesStore();
const commentDocInLeaderRef = ref<InstanceType<typeof CommentDocInLeader> | null>(null);
const commentDocInSupportRef = ref<InstanceType<typeof CommentDocInSupport> | null>(null);

function loadComments() {
  if (userDeptRole.roleId == RoleType.LANH_DAO) {
    commentDocInLeaderRef.value?.loadComments();
  } else {
    commentDocInSupportRef.value?.loadComments();
  }
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
