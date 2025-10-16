<template>
  <DocSubmitLookupSpecialist v-if='userDeptRole.roleId==RoleType.CHUYEN_VIEN'/>
  <DocSubmitLookupCommon v-else-if='!isClerk(userDeptRole.roleId)'/>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';

import { isClerk, RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocSubmitLookupCommon from '@/apps/document/views/book/component/doc-submit/DocSubmitLookupCommon.vue';
import DocSubmitLookupSpecialist from '@/apps/document/views/book/component/doc-submit/DocSubmitLookupSpecialist.vue';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

</script>

<style scoped>

</style>