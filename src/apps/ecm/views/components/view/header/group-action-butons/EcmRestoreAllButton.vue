<template>
  <ButtonIcon
    class='px-3 py-2'
    :class='currentIds.length ? "" : "p-disabled"'
    icon='restore_from_trash'
    icon-size='1.5'
    :label='t("ecm.storage.fileFolderActions.restoreAll")'
    severity='success'
    @click='confirmRestoreAll'/>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { confirmRestoreAll } from '@/apps/ecm/service/action-file-folder';
import { useStorageStore } from '@/apps/ecm/store/storage';

const { t } = useI18n();
const { currentIds } = storeToRefs(useStorageStore());
</script>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({ name: 'EcmRestoreAllButton' });
</script>

<style scoped>

</style>