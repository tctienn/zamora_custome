<template>
  <CommentDocSubmitLeader
    v-if='userDeptRole.roleId==RoleType.LANH_DAO'
    ref='commentDocSubmitLeaderRef'
    :content-style='contentStyle'
    :doc-id='docId'/>
  <CommentDocSubmitSupport
    v-else
    ref='commentDocSubmitSupportRef'
    :content-style='contentStyle'
    :doc-id='docId'/>

</template>

<script lang='ts' setup>

import { computed, provide, ref } from 'vue';

import { delComment, editComment, replyComment } from '@/apps/document/api/rest/comment';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocSubmitLeader
  from '@/apps/document/views/doc/component/comment/comment-doc-submit/CommentDocSubmitLeader.vue';
import CommentDocSubmitSupport
  from '@/apps/document/views/doc/component/comment/comment-doc-submit/CommentDocSubmitSupport.vue';
import { createFormCommentDocSubmit } from '@/apps/document/views/doc/component/comment/comment-utils';

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
const commentDocSubmitLeaderRef = ref<InstanceType<typeof CommentDocSubmitLeader> | null>(null);
const commentDocSubmitSupportRef = ref<InstanceType<typeof CommentDocSubmitSupport> | null>(null);

function loadComments() {
  if (userDeptRole.roleId == RoleType.LANH_DAO) {
    commentDocSubmitLeaderRef.value?.loadComments();
  } else {
    commentDocSubmitSupportRef.value?.loadComments();
  }
}

provide('deleteMessage', delComment);
provide('sendEditMessage', editComment);
provide('sendReplyMessage', replyComment);
provide('contentStyle', props.contentStyle);
defineExpose({ loadComments });
provide('createFormComment', createFormCommentDocSubmit);

const disableComputed = computed(() => props.disabled);
provide('disabled', disableComputed);
</script>

<style scoped>

</style>
