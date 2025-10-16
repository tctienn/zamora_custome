<template>
  <div class='border-bottom-1 flex flex-row surface-border'>
    <div class='col-8 font-bold pl-6'>
      {{t("ecm.storage.name")}}
    </div>
    <div class='col-2 font-bold text-center'>
      {{t("ecm.storage.lastModifiedAt")}}
    </div>
    <div class='col-2 font-bold text-center'>
      {{t("ecm.storage.fileSize")}}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<script lang="ts">
export default { name: 'ResultNameHeader' };
</script>

<style scoped>

</style>