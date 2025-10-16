<template>
  <CommentDocOutLeader
    v-if='userDeptRole.roleId==RoleType.LANH_DAO'
    ref='commentDocOutLeaderRef'
    :content-style='contentStyle'
    :doc-id='docId'/>
  <CommentDocOutSupport
    v-else
    ref='commentDocOutSupportRef'
    :content-style='contentStyle'
    :doc-id='docId'/>

</template>

<script lang='ts' setup>

import { computed, provide, ref } from 'vue';

import { delComment, editComment, replyComment } from '@/apps/document/api/rest/comment';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocOutLeader from '@/apps/document/views/doc/component/comment/comment-doc-out/CommentDocOutLeader.vue';
import CommentDocOutSupport from '@/apps/document/views/doc/component/comment/comment-doc-out/CommentDocOutSupport.vue';
import { createFormCommentDocOut } from '@/apps/document/views/doc/component/comment/comment-utils';

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
const commentDocOutLeaderRef = ref<InstanceType<typeof CommentDocOutLeader> | null>(null);
const commentDocOutSupportRef = ref<InstanceType<typeof CommentDocOutSupport> | null>(null);

function loadComments() {
  if (userDeptRole.roleId == RoleType.LANH_DAO) {
    commentDocOutLeaderRef.value?.loadComments();
  } else {
    commentDocOutSupportRef.value?.loadComments();
  }
}

provide('deleteMessage', delComment);
provide('sendEditMessage', editComment);
provide('sendReplyMessage', replyComment);
provide('contentStyle', props.contentStyle);
defineExpose({ loadComments });
provide('createFormComment', createFormCommentDocOut);

const disableComputed = computed(() => props.disabled);
provide('disabled', disableComputed);
</script>

<style scoped>

</style>
