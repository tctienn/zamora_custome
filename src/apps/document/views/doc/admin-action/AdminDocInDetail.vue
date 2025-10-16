<template>
  <DocumentInMoreDetail :doc-id='docId'></DocumentInMoreDetail>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import DocumentInMoreDetail from '@/apps/document/views/doc/doc-in/detail/DocumentInMoreDetail.vue';

const route = useRoute();

const docId = route.params.id as string;
</script>

<style scoped>

</style>