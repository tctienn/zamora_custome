<template>
  <OutNextButtonsOutSideSpecialist
    v-if='userDeptRole.roleId===RoleType.CHUYEN_VIEN'
    :doc='doc'
    :is-specialist-draft='isSpecialistDraft'/>
  <OutNextButtonsOutSideCommon
    v-else
    :doc='doc'
    :process='process'>
  </OutNextButtonsOutSideCommon>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { inject, type PropType, toRef } from 'vue';

import type { DocOut } from '@/apps/document/model/doc/doc-out';
import { RoleType } from '@/apps/document/model/permission';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import OutNextButtonsOutSideCommon
  from '@/apps/document/views/doc/doc-out/component/next-buttons-outside/OutNextButtonsOutSideCommon.vue';
import OutNextButtonsOutSideSpecialist
  from '@/apps/document/views/doc/doc-out/component/next-buttons-outside/OutNextButtonsOutSideSpecialist.vue';

defineProps({
  process: {
    type: Object as PropType<Process>,
    default: undefined,
  },
  doc: {
    type: Object as PropType<DocOut>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false
  },
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const isSpecialistDraft = inject('isSpecialistDraft', toRef(false));
</script>

<style scoped>

</style>