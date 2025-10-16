<template>
  <Button
    icon='pi pi-folder'
    :label='t("ecm.storage.createFileFolder", { type: lowerCase(t("common.folder")) })'
    :size='size'
    @click='openNewFolderDialog'/>
  <FileFolderSaveDialog ref='saveDialog'/>
</template>

<script lang='ts' setup>

import { lowerCase } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { EcmFolder } from '@/apps/ecm/model/file-folder';
import FileFolderSaveDialog from '@/apps/ecm/views/components/view/header/dropdown-action/FileFolderSaveDialog.vue';

defineProps({
  size: {
    type: String as PropType<'small' | 'large'>,
    default: 'small'
  }
});

const { t } = useI18n();

const saveDialog = ref<InstanceType<typeof FileFolderSaveDialog>>();

function openNewFolderDialog() {
  saveDialog.value?.toggleDialog({} as EcmFolder, true, null);
}
</script>

<style scoped>

</style>
