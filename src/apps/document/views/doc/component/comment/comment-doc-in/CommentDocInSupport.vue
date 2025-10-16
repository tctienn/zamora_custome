<template>
  <CommentDocContainer
    :available-users='availableUsers'
    :comments='commentProcessed'
    @load-default-comments='isPrivate = false'
    @load-private-comments='isPrivate = true'
    @new-chat-comment='newChatComment'/>
</template>

<script lang="ts" setup>
import { groupBy } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, provide, ref, watch, watchEffect } from 'vue';

import { getUserSupportByUserId } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { docInRelatedUsers, listCommentsGraphql, listPrivateCommentsGrahql, } from '@/apps/document/api/graphql/comment';
import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { createChatComment } from '@/apps/document/api/rest/comment';
import {
  CommentSendType,
  type DocComment,
  ObjectTypeEnum,
  type PrivateCommentDocRequestInput,
} from '@/apps/document/model/comment';
import { type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { RoleType } from '@/apps/document/model/permission';
import type { InComingProcess } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { useUserSupportStore } from '@/apps/document/store/user-support';
import {
  createFormCommentDocIn,
  mapChildren,
  mapToComment,
  processComment,
} from '@/apps/document/views/doc/component/comment/comment-utils';
import CommentDocContainer from '@/apps/document/views/doc/component/comment/CommentDocContainer.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import { SupportPermission, type UserSupport } from '@/common/model/User';

const props = defineProps({
  docId: {
    type: String,
    required: true,
  },
  contentStyle: {
    type: Object,
    default: () => ({ maxHeight: 'calc(100vh - 26rem)' }),
  },
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const { fetchAllUsers } = useUserMoreInfoStore();
const { userSupport: me } = storeToRefs(useUserSupportStore());
const allowViewContent = computed(() => {
  return me.value?.supportsPermission?.includes(SupportPermission.ALLOW_VIEW_CONTENT);
});
const allowExchange = computed(() => {
  return me.value?.supportsPermission?.includes(SupportPermission.ALLOW_EXCHANGE);
});
const isPrivate = ref<boolean>(false);
const meAndPartner = ref<UserDeptRoleInput[]>([]);
const myLeader = ref<UserDeptRoleInput>();
// const myLeader = computed<UserDeptRoleInput>(() => {
//   return {
//     deptId: meAndPartner.value?.[0]?.deptId || '',
//     deptName: meAndPartner.value?.[0]?.deptName || '',
//     roleId: RoleType.LANH_DAO,
//     roleName: 'Lãnh đạo',
//     type: userDeptRole.type,
//     userId: me?.userId || '',
//     userName: usersMoreInfo[me?.userId || '']?.fullName
//   };
// });
watch([() => props.docId, isPrivate], () => {
  loadComments();
});
const comments = ref<DocComment[]>([]);
const privateComments = ref<DocComment[]>([]);
const availableUsers = computed<UserDeptRoleInput[]>(
  (): UserDeptRoleInput[] => {
    if (isPrivate.value) {
      return handlePrivateUsers();
    } else {
      return handlePublicUsers();
    }
  },
);

function handlePrivateUsers(): UserDeptRoleInput[] {
  const leader = myLeader.value ? [myLeader.value] : [];
  return [...leader, ...meAndPartner.value.filter(user => {
    if (allowExchange.value) {
      return user.userId != userDeptRole.value.userId;
    } else {
      return false;
    }

  })];
}

function handlePublicUsers(): UserDeptRoleInput[] {
  return result.value?.docInRelatedUsers || [];
}

const commentProcessed = computed(() => {
  let rs: DocComment[] = [];
  const temp = isPrivate.value ? privateComments.value : comments.value;

  temp.forEach((currentComment) => {
    processComment(rs, currentComment);
  });

  return [
    ...rs.filter((c) => !c.replyForId).map((c) => mapChildren(rs, c)),
    ...!isPrivate.value ? commentsFromLog.value : [],
  ];
});

const {
  result,
  load: loadUsers,
  variables,
} = docInRelatedUsers(props.docId, userDeptRole.value);
watch(
  () => props.docId,
  (docId) => {
    variables.value = {
      docId,
      userDeptRole: userDeptRole.value,
    };
  },
  { immediate: true },
);
const {
  onResult,
  refetch: listCommentRefetch,
  variables: listVariables,
} = listCommentsGraphql(ObjectTypeEnum.VB_DEN, props.docId, isPrivate.value);

const request = computed<PrivateCommentDocRequestInput>(() => {
  return {
    canViewPartner: allowViewContent.value || false,
    objectId: props.docId,
    objectType: ObjectTypeEnum.VB_DEN,
    userSupport: me.value as UserSupport,
    userDeptRole: userDeptRole.value
  };
});
const {
  onResult: onResultPrivate,
  refetch: listCommentRefetchPrivate,
  variables: listVariablesPrivate,
  load: listPrivateLoad,
} = listPrivateCommentsGrahql(request.value);
if (userDeptRole.value.roleId == RoleType.TRO_LY) {
  listPrivateLoad();
}
onResult((value) => {
  comments.value = value.data?.listComments;
});
onResultPrivate((value) => {
  privateComments.value = value.data?.listPrivateComments;
});

function loadComments() {
  if (props.docId) {
    if (!isPrivate.value) {
      listCommentRefetch(
        {
          objectType: ObjectTypeEnum.VB_DEN,
          objectId: props.docId,
          isPrivate: isPrivate.value,
        }
      );
    } else {
      listCommentRefetchPrivate({ request: request.value });
    }
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
      CommentSendType.CHAT,
      userDeptRole.value,
      props.docId,
      isPrivate.value,
    ),
  )
    .then((value) => {
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
  getAllProcessByDocIdForDrawRealFlow(props.docId, userDeptRole.value).onResult(
    (param) => {
      commentsFromLog.value = [];

      const groupByParentId: Record<string, InComingProcess[]> = groupBy(
        param.data.getAllProcessByDocIdForDrawRealFlow,
        (value) => value.parentId,
      );

      for (const groupByParentIdKey in groupByParentId) {
        let newComment: DocComment = mapToComment(
          groupByParentId[groupByParentIdKey][0],
        );
        newComment.receivers = groupByParentId[groupByParentIdKey].map((e) =>
          mapToComment(e),
        );
        commentsFromLog.value.push(newComment);
      }
    },
  );
});

//Private
watch(allowExchange, (value) => {
  if (me.value?.userId) {
    getUserSupportByUserId(me.value.userId, me.value.deptId).onResult(res => {
      const dataFiltered: UserSupport[] = res.data?.getUserSupportByUserIdAndDeptId
        ?.filter((user: UserSupport) => user.supportPermission.includes(SupportPermission.ADVISE_INCOMING_DOC));
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
        const dept = getDeptIdForSupport(userDeptRole.value.type, user);
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

function reloadListComment() {
  if (!isPrivate.value) {
    listCommentRefetch();
  } else {
    listCommentRefetchPrivate();
  }
}

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
      deptId: userDeptRole.value.deptId,
      deptName: userDeptRole.value.deptName,
    };
  }
}

provide('loadComments', reloadListComment);
defineExpose({ loadComments });
onMounted(() => fetchAllUsers());
</script>

<style scoped></style>
