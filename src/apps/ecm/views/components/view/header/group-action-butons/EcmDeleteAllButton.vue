<template>
  <ButtonIcon
    class='px-3 py-2'
    :class='currentIds.length ? "" : "p-disabled"'
    icon='delete'
    icon-size='1.5'
    :label='t("common.deleteAll")'
    severity='danger'
    @click='confirmDeleteAll'/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { confirmDeleteAll } from '@/apps/ecm/service/action-file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';

const { t } = useI18n();
const { currentIds } = storeToRefs(useStorageStore());
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'EcmDeleteAllButton' });
</script>

<style scoped>

</style>