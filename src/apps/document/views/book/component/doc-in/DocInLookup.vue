<template>
  <DocInLookupClerk v-if='isClerk(userDeptRole.roleId)'/>
  <DocInLookupCommon v-else/>
</template>

<script lang="ts" setup>

import { isClerk } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocInLookupClerk from '@/apps/document/views/book/component/doc-in/DocInLookupClerk.vue';
import DocInLookupCommon from '@/apps/document/views/book/component/doc-in/DocInLookupCommon.vue';

const { userDeptRole } = useDocumentRolesStore();
</script>

<style scoped>

</style>