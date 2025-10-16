<template>
  <div class='content-header'>
    <Breadcrumb
      class='bg-transparent ecm-breadcrumb pl-3'
      :model='[{label: t("ecm.menu.ecmPersonalDocumentsRecentDocuments"), to: route.path}]'>
    </Breadcrumb>
  </div>

  <OneLayerDocuments :service-type='ServiceType.PERSON_RECENT'></OneLayerDocuments>
</template>

<script setup lang='ts'>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import OneLayerDocuments from '@/apps/ecm/views/personal-documents/OneLayerDocuments.vue';

const { t } = useI18n();
const route = useRoute();
</script>

<script lang='ts'>
export default { name: 'RecentDocuments' };
</script>

<style scoped>

</style>