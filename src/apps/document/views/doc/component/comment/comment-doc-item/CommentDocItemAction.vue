<template>
  <div
    class='flex flex-column gap-1 w-full'>
    <div
      class='border-round flex flex-column gap-1 p-3 relative surface-200 w-full'
      :class="{[' text-gray-800']:isMine}"
      style='background: #DBF4FD !important;color: black'>
      <div>
        <div>
          {{ t(getGender(usersMoreInfo[sender.userId]?.gender)) }}
          <span class='font-semibold'> {{ sender.userName }}</span>
        </div>
        <div class='flex gap-2'>
          <div
            class='align-items-center flex font-semibold gap-1 text-blue-500'>
            <span style='white-space:nowrap'>
              <AppIcon name='start'/>
              {{
                comment?.actionName
              }}
            </span>
          </div>
          <CommentDocItemReceivers
            :receivers='receivers'/>
        </div>
      </div>
      {{ comment?.content }}
      <CommentDocItemAttachment
        :attachments='comment?.attachments'/>
      <div class='flex justify-content-between text-sm'>
        {{
          comment?.sendTime
            ? moment(comment?.sendTime).format('HH:mm DD/MM/YYYY')
            : ''
        }}
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { DocComment } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import CommentDocItemAttachment
  from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItemAttachment.vue';
import CommentDocItemReceivers
  from '@/apps/document/views/doc/component/comment/comment-doc-item/CommentDocItemReceivers.vue';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  comment: {
    type: Object as PropType<DocComment>,
    default: undefined,
  },
});
const { moment } = useMoment();
const { t } = useI18n();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const { userDeptRole } = useDocumentRolesStore();
const sender = computed(() => senderUserDeptRole(props.comment));
const receivers = computed(() => receiverUserDeptRole(props.comment));
const isMine = computed(() => {
  return (
    props.comment?.fromUserId == userDeptRole.userId
  // && props.comment?.fromDeptId == userDeptRole.deptId
  // && props.comment?.fromRoleId == userDeptRole.roleId
  );
});

function senderUserDeptRole(
  comment: DocComment | undefined,
): UserDeptRoleInput {
  return {
    userId: comment?.fromUserId || '',
    deptId: comment?.fromDeptId || '',
    roleId: comment?.fromRoleId || '',
    userName: comment?.fromUserName || '',
    deptName: comment?.fromDeptName || '',
    roleName: comment?.fromRoleName || '',
    type: OrganizationType.ADMINISTRATIVE,
  };
}

function receiverUserDeptRole(
  comment: DocComment | undefined,
): DocComment[] {
  return comment?.receivers || [];
  // return {
  //   userId: comment?.toUserId || '',
  //   deptId: comment?.toDeptId || '',
  //   roleId: comment?.toRoleId || '',
  //   userName: comment?.toUserName || '',
  //   deptName: comment?.toDeptName || '',
  //   roleName: comment?.toRoleName || '',
  //   type: OrganizationType.ADMINISTRATIVE,
  // };
}

const receiveUserDeptRoleAvatar = computed(() => {
  return props.comment?.receivers?.map((docComment: DocComment): UserDeptRoleInput => {
    return {
      deptId: docComment.toDeptId || '',
      deptName: docComment.toDeptName || '',
      roleId: docComment.toRoleId || '',
      roleName: docComment.toRoleName || '',
      type: OrganizationType.ADMINISTRATIVE || '',
      userId: docComment.toUserId || '',
      userName: docComment.toUserName || ''
    };
  }) || [];
});
</script>

<style scoped>

</style>