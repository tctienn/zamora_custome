<template>
  <NextButtonsOutSideClerk
    v-if='isClerk(userDeptRole.roleId)'
    :doc='doc'
    :is-clerk-receive='isClerkReceive'/>
  <NextButtonsOutSideCommon
    v-else
    :doc='doc'
    :process='process'>
  </NextButtonsOutSideCommon>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { inject, type PropType, toRef } from 'vue';

import type { DocIn } from '@/apps/document/model/doc/doc-in';
import { isClerk } from '@/apps/document/model/permission';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import NextButtonsOutSideClerk
  from '@/apps/document/views/doc/doc-in/component/next-buttons-outside/NextButtonsOutSideClerk.vue';
import NextButtonsOutSideCommon
  from '@/apps/document/views/doc/doc-in/component/next-buttons-outside/NextButtonsOutSideCommon.vue';

defineProps({
  process: {
    type: Object as PropType<Process>,
    default: undefined
  },
  doc: {
    type: Object as PropType<DocIn>,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  classBtn: {
    type: String,
    default: ''
  }
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const isClerkReceive = inject('isClerkReceive', toRef(false));
</script>

<style scoped>

</style>