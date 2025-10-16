<template>
  <DocOutItem v-bind='$props'>
    <template #sender='{doc}'>
      <AppUserDeptRole
        avatar-size='2.5'
        overlay-visible
        :user-dept-role='editorUserDeptRole(doc)'/>
      <AppIcon
        v-if='model?.revokeType === RevokeType.CANCEL'
        v-tooltip='t("document.doc.cancelProclaimed")'
        name='unpublished'
        size='1.2'/>
    </template>
    <template #date>
      <div
        v-if='model?.docDate'
        class='text-sm'>{{ moment(model?.docDate).format('DD/MM/YYYY') }}
      </div>
    </template>
  </DocOutItem>
</template>

<script lang='ts' setup>

import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { type DocOut, RevokeType } from '@/apps/document/model/doc/doc-out';
import { OrganizationType } from '@/apps/document/model/organization';
import DocOutItem from '@/apps/document/views/doc/doc-out/list/item/DocOutItem.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

defineProps({
  model: {
    type: Object as PropType<DocOut>,
    default: undefined
  },
  selected: {
    type: Boolean,
    default: false
  }
});

const { moment } = useMoment();
const { t } = useI18n();

function editorUserDeptRole(doc: DocOut | undefined): UserDeptRoleInput {
  return {
    userId: doc?.editorId || '',
    deptId: doc?.editorDeptId || '',
    roleId: doc?.editorRoleId || '',
    userName: doc?.editorName || '',
    deptName: doc?.editorDeptName || '',
    roleName: doc?.editorRoleName || '',
    type: OrganizationType.ADMINISTRATIVE
  };
}
</script>

<style scoped>

</style>