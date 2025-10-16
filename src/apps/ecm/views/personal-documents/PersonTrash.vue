<template>
  <div class='content-header'>
    <Breadcrumb
      class='bg-transparent ecm-breadcrumb pl-3'
      :model='[{label: t("ecm.menu.ecmPersonalDocumentsRecycleBin"), to: route.path}]'>
    </Breadcrumb>
  </div>
  <OneLayerDocuments :service-type='ServiceType.PERSON_TRASH'></OneLayerDocuments>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import OneLayerDocuments from '@/apps/ecm/views/personal-documents/OneLayerDocuments.vue';

export default defineComponent({
  name: 'PersonTrash',
  components: { OneLayerDocuments },

  setup() {
    const { t } = useI18n();
    const route = useRoute();

    return {
      t,
      route
    };
  },

  computed: {
    ServiceType() {
      return ServiceType;
    }
  },
});

</script>

<style scoped>

</style>