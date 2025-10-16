<template>
  <SubmitNextButtonsOutSideSpecialist
    v-if='userDeptRole.roleId===RoleType.CHUYEN_VIEN'
    :disabled='disabled'
    :doc='doc'
    :is-specialist-draft='isSpecialistDraft'/>
  <SubmitNextButtonsOutSideCommon
    v-else
    :disabled='disabled'
    :doc='doc'
    :process='process'/>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { inject, type PropType, toRef } from 'vue';

import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import { RoleType } from '@/apps/document/model/permission';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import SubmitNextButtonsOutSideCommon
  from '@/apps/document/views/doc/submit/component/next-buttons-outside/SubmitNextButtonsOutSideCommon.vue';
import SubmitNextButtonsOutSideSpecialist
  from '@/apps/document/views/doc/submit/component/next-buttons-outside/SubmitNextButtonsOutSideSpecialist.vue';

defineProps({
  process: {
    type: Object as PropType<Process>,
    default: undefined,
  },
  doc: {
    type: Object as PropType<DocSubmit>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const isSpecialistDraft = inject('isSpecialistDraft', toRef(false));
</script>

<style scoped>

</style>