<template>
  <CommentDocContainer
    :available-users='availableUsers'
    :comments='commentProcessed'
    @load-default-comments='loadComments'
    @new-chat-comment='newChatComment'/>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, provide, ref, watch } from 'vue';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getListJobChatByJobId, getListUserRelatedToJobId } from '@/apps/mission/api/graphql/comment-api';
import { createChatComment } from '@/apps/mission/api/rest/comment';
import { createFormCommentDocIn, mapChildren, processComment } from '@/apps/mission/helpers/comment-utils';
import type { DocComment } from '@/apps/mission/model/doc/doc-in';
import { toastError } from '@/common/helpers/custom-toast-service';

import CommentDocContainer from '../CommentDocContainer.vue';

const props = defineProps({
  jobId: {
    type: String,
    default: undefined
  },
  contentStyle: {
    type: Object,
    default: () => ({ maxHeight: 'calc(100vh - 26rem)' }),
  },
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { fetchAllUsers } = useUserMoreInfoStore();
const {
  result,
  load: loadUsers,
  variables,
} = getListUserRelatedToJobId(props.jobId || '');

watch([() => props.jobId], () => {
  loadComments();
});
const comments = ref<DocComment[]>([]);
const availableUsers = computed<UserDeptRoleInput[]>(
  (): UserDeptRoleInput[] => {
    return handlePublicUsers();
  },
);

function handlePublicUsers(): UserDeptRoleInput[] {
  const res = result.value?.getListUserRelatedToJobId || [];
  
  return res.map((user: {userId: string, userName: string, userDepartmentId: string, userDepartmentName: string, userRoleId: string, userRoleName: string}) => ({
    userId: user.userId,
    userName: user.userName,
    deptId: user.userDepartmentId,
    deptName: user.userDepartmentName,
    roleId: user.userRoleId,
    roleName: user.userRoleName,
  }));
}

const commentProcessed = computed(() => {
  let rs: DocComment[] = [];
  const temp = comments.value;

  temp?.forEach((currentComment) => {
    processComment(rs, currentComment);
  });

  return [
    ...rs.filter((c) => !c.replyForChatId).map((c) => mapChildren(rs, c))
  ];
});

watch(
  () => props.jobId,
  (jobId) => {
    if( jobId){
      variables.value = { jobId };
    }
  },
  { immediate: true },
);
const {
  onResult,
  refetch: listCommentRefetch,
} = getListJobChatByJobId(props.jobId || '');

onResult((value) => {
  comments.value = value.data?.getListJobChatByJobId;
});

function loadComments() {
  if (props.jobId) {
    listCommentRefetch(
      { jobId: props.jobId, }
    );
  }
}

onMounted(() => {
  loadUsers();
});

function newChatComment(
  content: string,
  attachments: FileList | undefined,
  selectedUsers: UserDeptRoleInput[],
) {
  createChatComment(
    createFormCommentDocIn(
      content,
      attachments,
      selectedUsers,
      userDeptRole.value,
      props.jobId || '',
    ),
  )
    .then(() => {
      listCommentRefetch();
    })
    .catch(toastError);
}

function reloadListComment() {
  listCommentRefetch();
}

provide('loadComments', reloadListComment);
defineExpose({ loadComments });
onMounted(() => fetchAllUsers());
</script>

<style scoped></style>
