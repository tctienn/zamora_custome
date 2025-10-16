<template>
  <CommentDocContainer
    :available-users='availableUsers'
    :comments='commentProcessed'
    @load-default-comments='isPrivate=false'
    @load-private-comments='isPrivate=true'
    @new-chat-comment='newChatComment'/>
</template>

<script lang="ts" setup>

import { groupBy } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, provide, ref, watch, watchEffect } from 'vue';

import { getUserSupportByUserId } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { docOutRelatedUsers, listCommentsGraphql, listPrivateCommentsGrahql } from '@/apps/document/api/graphql/comment';
import { getAllOutProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/outgoing-process';
import { createChatComment } from '@/apps/document/api/rest/comment';
import {
  CommentSendType,
  type DocComment,
  ObjectTypeEnum,
  type PrivateCommentDocRequestInput
} from '@/apps/document/model/comment';
import { type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { RoleType } from '@/apps/document/model/permission';
import type { OutgoingProcess } from '@/apps/document/model/process/outgoing';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useUserSupportStore } from '@/apps/document/store/user-support';
import {
  createFormCommentDocOut,
  mapChildren,
  mapToComment,
  processComment
} from '@/apps/document/views/doc/component/comment/comment-utils';
import CommentDocContainer from '@/apps/document/views/doc/component/comment/CommentDocContainer.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import { SupportPermission, type UserSupport } from '@/common/model/User';

const props = defineProps({
  docId: {
    type: String,
    required: true
  },
  contentStyle: {
    type: Object,
    default: () => ({ maxHeight: 'calc(100vh - 26rem)' })
  }
});
const { userDeptRole } = useDocumentRolesStore();
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const { fetchAllUsers } = useUserMoreInfoStore();
const { userSupport: me } = useUserSupportStore();
const allowViewContent = computed(() => {
  return me?.supportsPermission?.includes(SupportPermission.ALLOW_VIEW_CONTENT);
});
const allowExchange = computed(() => {
  return me?.supportsPermission?.includes(SupportPermission.ALLOW_EXCHANGE);
});
const isPrivate = ref<boolean>(false);
const myLeader = ref<UserDeptRoleInput>();

const meAndPartner = ref<UserDeptRoleInput[]>([]);
watch([() => props.docId, isPrivate], () => {
  loadComments();
});
const comments = ref<DocComment[]>([]);
const privateComments = ref<DocComment[]>([]);
const availableUsers = computed<UserDeptRoleInput[]>((): UserDeptRoleInput[] => {
  if (isPrivate.value) {
    return handlePrivateUsers();
  } else {
    return handlePublicUsers();
  }
});

function handlePrivateUsers(): UserDeptRoleInput[] {
  const leader = myLeader.value ? [myLeader.value] : [];
  return [...leader, ...meAndPartner.value.filter(user => {
    if (allowExchange.value) {
      return user.userId != userDeptRole.userId;
    } else {
      return false;
    }

  })];
}

function handlePublicUsers(): UserDeptRoleInput[] {
  return result.value?.docOutRelatedUsers || [];
}

const commentProcessed = computed(() => {
  let rs: DocComment[] = [];
  const temp = isPrivate.value ? privateComments.value : comments.value;

  temp.forEach((currentComment) => {
    processComment(rs, currentComment);
  });

  return [
    ...rs.filter(c => !c.replyForId).map(c => mapChildren(rs, c)),
    ...!isPrivate.value ? commentsFromLog.value : []
  ];
});

const {
  result,
  load: loadUsers,
  variables
} = docOutRelatedUsers(props.docId, userDeptRole);
watch(() => props.docId, (docId) => {
  variables.value = {
    docId,
    userDeptRole
  };
}, { immediate: true });
const {
  onResult,
  refetch: listCommentRefetch,
  variables: listVariables
} = listCommentsGraphql(ObjectTypeEnum.VB_DI, props.docId, isPrivate.value);

const request = computed<PrivateCommentDocRequestInput>(() => {
  return {
    canViewPartner: allowViewContent.value || false,
    objectId: props.docId,
    objectType: ObjectTypeEnum.VB_DI,
    userSupport: me as UserSupport,
    userDeptRole: userDeptRole
  };
});
const {
  onResult: onResultPrivate,
  refetch: listCommentRefetchPrivate,
  variables: listVariablesPrivate,
  load: listPrivateLoad,
} = listPrivateCommentsGrahql(request.value);
if (userDeptRole.roleId == RoleType.TRO_LY) {
  listPrivateLoad();
}
onResult(value => {
  comments.value = value.data?.listComments;
});
onResultPrivate(value => {
  privateComments.value = value.data?.listPrivateComments;
});

function loadComments() {
  if (props.docId) {
    if (!isPrivate.value) {
      listCommentRefetch(
        {
          objectType: ObjectTypeEnum.VB_DI,
          objectId: props.docId,
          isPrivate: isPrivate.value
        }
      );
    } else {
      listVariablesPrivate.value = { request: request.value };
    }
  }
}

onMounted(() => {
  loadUsers();
});

function newChatComment(content: string, attachments: FileList | undefined, selectedUsers: UserDeptRoleInput[]) {
  createChatComment(createFormCommentDocOut(content, attachments, selectedUsers, CommentSendType.CHAT, userDeptRole, props.docId, isPrivate.value,))
    .then(value => {
      if (!isPrivate.value) {
        listCommentRefetch();
      } else {
        listCommentRefetchPrivate();
      }
    })
    .catch(toastError);
}

const commentsFromLog = ref<DocComment[]>([]);
watchEffect(() => {
  getAllOutProcessByDocIdForDrawRealFlow(props.docId, userDeptRole).onResult(param => {
    commentsFromLog.value = [];

    const groupByParentId: Record<string, OutgoingProcess[]> = groupBy(param.data.getAllOutProcessByDocIdForDrawRealFlow, value => value.parentId);

    for (const groupByParentIdKey in groupByParentId) {
      let newComment: DocComment = mapToComment(groupByParentId[groupByParentIdKey][0]);
      newComment.receivers = groupByParentId[groupByParentIdKey].map(e => mapToComment(e));
      commentsFromLog.value.push(newComment);
    }
  });
});

//Private
watch(allowExchange, (value) => {
  if (me?.userId) {
    getUserSupportByUserId(me.userId, me.deptId).onResult(res => {
      const dataFiltered: UserSupport[] = res.data?.getUserSupportByUserIdAndDeptId
        ?.filter((user: UserSupport) => user.supportPermission.includes(SupportPermission.ADVISE_OUTGOING_DOC));
      if (dataFiltered?.[0]) {
        myLeader.value = {
          deptId: dataFiltered?.[0]?.deptId || '',
          deptName: '',
          roleId: RoleType.LANH_DAO,
          roleName: 'Lãnh đạo',
          type: dataFiltered?.[0]?.orgType || '',
          userId: dataFiltered?.[0]?.userId || '',
          userName: usersMoreInfo.value[dataFiltered?.[0]?.userId || '']?.fullName
        };
      }
      meAndPartner.value = dataFiltered.map((user: UserSupport): UserDeptRoleInput => {
        const dept = getDeptIdForSupport(userDeptRole.type, user);
        return {
          deptId: dept.deptId,
          deptName: dept.deptName,
          roleId: RoleType.TRO_LY,
          roleName: 'Trợ lý',
          type: user.orgType,
          userId: user.userSupportId,
          userName: usersMoreInfo.value[user.userSupportId]?.fullName || ''
        };
      });

    });
  }
}, { immediate: true });

function getDeptIdForSupport(orgType: OrganizationType, userSupport: UserSupport): {
  deptId: string;
  deptName: string;
} {
  switch (orgType) {
  case OrganizationType.ADMINISTRATIVE:
    return {
      deptId: usersMoreInfo.value[userSupport.userSupportId]?.departments?.[0].id || '',
      deptName: usersMoreInfo.value[userSupport.userSupportId]?.departments?.[0].name || '',
    };
  case OrganizationType.UNION:
  case OrganizationType.PARTY:
    return {
      deptId: userDeptRole.deptId,
      deptName: userDeptRole.deptName,
    };
  }
}

function reloadListComment() {
  if (!isPrivate.value) {
    listCommentRefetch();
  } else {
    listCommentRefetchPrivate();
  }
}

provide('loadComments', reloadListComment);
defineExpose({ loadComments });
onMounted(() => fetchAllUsers());
</script>

<style scoped>

</style>