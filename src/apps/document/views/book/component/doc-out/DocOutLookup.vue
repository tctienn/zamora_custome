<template>
  <DocOutLookupClerk v-if='isClerk(userDeptRole.roleId)'/>
  <DocOutLookupSpecialist v-else-if='userDeptRole.roleId==RoleType.CHUYEN_VIEN'/>
  <DocOutLookupCommon v-else/>
</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';

import { isClerk, RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocOutLookupClerk from '@/apps/document/views/book/component/doc-out/DocOutLookupClerk.vue';
import DocOutLookupCommon from '@/apps/document/views/book/component/doc-out/DocOutLookupCommon.vue';
import DocOutLookupSpecialist from '@/apps/document/views/book/component/doc-out/DocOutLookupSpecialist.vue';

const { userDeptRole } = storeToRefs(useDocumentRolesStore());

</script>

<style scoped>

</style>