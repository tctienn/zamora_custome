<template>
  <DocInItem
    :model='model'
    :selected='selected'>
    <template #sender='{doc}'>
      <AppUserDeptRole
        v-if='model?.comment'
        avatar-size='2.5'
        overlay-visible
        :user-dept-role='commentUserDeptRole(doc)'/>
    </template>
    <template #date='{doc}'>
      <div class='text-sm'>
        {{ doc?.comment?.sendTime ? moment(doc?.comment?.sendTime).format('DD/MM/YYYY HH:mm') : '' }}
      </div>
    </template>
  </DocInItem>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';

import type { DocIn, UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import DocInItem from '@/apps/document/views/doc/doc-in/list/item/DocInItem.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});
const { moment } = useMoment();

function commentUserDeptRole(doc: DocIn | undefined) {
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
