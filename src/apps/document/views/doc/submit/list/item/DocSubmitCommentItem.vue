<template>
  <DocSubmitItem v-bind='$props'>
    <template #sender='{doc}'>
      <AppUserDeptRole
        avatar-size='2.5'
        overlay-visible
        :user-dept-role='commentUserDeptRole(doc)'/>
    </template>
    <template #date>
      <div
        v-if='model?.comment?.sendTime'
        class='text-sm'>{{ moment(model?.comment?.sendTime).format('DD/MM/YYYY HH:mm') }}
      </div>
    </template>
  </DocSubmitItem>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import DocSubmitItem from '@/apps/document/views/doc/submit/list/item/DocSubmitItem.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocSubmit>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const { moment } = useMoment();

function commentUserDeptRole(doc: DocSubmit | undefined) {
  if (doc?.comment) {
    return {
      userId: doc.comment.fromUserId,
      deptId: doc.comment.fromDeptId,
      roleId: doc.comment.fromRoleId,
      userName: doc.comment.fromUserName,
      deptName: doc.comment.fromDeptName,
      roleName: doc.comment.fromRoleName,
    } as UserDeptRoleInput;
  }
}
</script>

<style scoped>

</style>
