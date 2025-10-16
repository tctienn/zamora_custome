<template>
  <DocSubmitItem v-bind='$props'>
    <template #sender='{doc}'>
      <AppUserDeptRole
        avatar-size='2.5'
        overlay-visible
        :user-dept-role='processUseDeptRole(doc)'/>
      <i
        v-if='model?.process?.processType === DocOutProcessType.PHOI_HOP'
        v-tooltip='t("document.doc.coordinatedProcessing")'
        class='pi pi-users'></i>
    </template>
    <template #date>
      <div
        v-if='model?.process?.sendTime'
        class='text-sm'>{{ moment(model?.process?.sendTime).format('DD/MM/YYYY HH:mm') }}
      </div>
    </template>
  </DocSubmitItem>
</template>

<script lang='ts' setup>
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { DocOutProcessType } from '@/apps/document/model/process/outgoing';
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
const { t } = useI18n();

function processUseDeptRole(doc: DocSubmit | undefined) {
  if (doc?.process) {
    return {
      userId: doc.process.senderId,
      deptId: doc.process.senderDeptId,
      roleId: doc.process.senderRoleId,
      userName: doc.process.senderName,
      deptName: doc.process.senderDeptName,
      roleName: doc.process.senderRoleName,
    } as UserDeptRoleInput;
  }
}
</script>

<style scoped>

</style>
