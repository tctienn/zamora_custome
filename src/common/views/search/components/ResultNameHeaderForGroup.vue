<template>
  <div class='border-bottom-1 flex flex-row surface-border'>
    <div class='col-6 font-bold pl-6'>
      {{ t("admin.userGroup.groupName") }}
    </div>
    <div class='col-4 font-bold text-center'>
      {{ t("admin.userGroup.types.member") }}
    </div>
    <div class='col-2 font-bold text-center'>
      {{ t("admin.userGroup.groupType") }}
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