<template>
  <DocInItem
    :model='model'
    :selected='selected'>
    <template #sender='{doc}'>
      <AppUserDeptRole
        v-if='model?.cc'
        avatar-size='2.5'
        overlay-visible
        :user-dept-role='ccUserDeptRole(doc)'/>
    </template>
    <template #date='{doc}'>
      <div class='text-sm'>
        {{ doc?.cc?.sendTime ? moment(doc?.cc?.sendTime).format('DD/MM/YYYY HH:mm') : '' }}
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

function ccUserDeptRole(doc: DocIn | undefined) {
  if (doc?.cc) {
    return {
      userId: doc.cc.senderId,
      deptId: doc.cc.senderDeptId,
      roleId: doc.cc.senderRoleId,
      userName: doc.cc.senderName,
      deptName: doc.cc.senderDeptName,
      roleName: doc.cc.senderRoleName,
    } as UserDeptRoleInput;
  }
}
</script>

<style scoped>

</style>
