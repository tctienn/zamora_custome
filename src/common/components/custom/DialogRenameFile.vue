<template>
  <Dialog
    v-model:visible='visibleDialog'
    :header="'Đổi tên file'"
    v-bind='DEFAULT_DIALOG_CONFIG'
    style='width: 40vw'
    @hide="emits('hide-dialog')">
    <div class='flex gap-2'>
      <label
        v-required
        class='col-2 font-semibold'>Tên file mới</label>
      <InputText
        v-model='attachment.fileName'
        class='col'/>
      <InputText
        v-model='attachment.fileExtension'
        class='col-2'
        disabled/>
    </div>
    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog")'/>
        <Button
          icon='pi pi-check'
          :label='t("common.save")'
          @click='saveName'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">

import { cloneDeep } from 'lodash';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  file: {
    type: Object as PropType<DocumentAttachment>,
    default: {} as DocumentAttachment
  }
}
);
const emits = defineEmits(['hide-dialog', 'save-name']);
const attachment = ref<DocumentAttachment>(cloneDeep(props.file));
const { t } = useI18n();
const visibleDialog = ref(props.visible);

function saveName() {
  emits('save-name', {
    ...attachment.value,
    fullName: `${attachment.value.fileName}.${attachment.value.fileExtension}`,
  });
}
</script>

<script lang="ts">
export default { name: 'DialogRenameFile' };
</script>

<style scoped>

</style>