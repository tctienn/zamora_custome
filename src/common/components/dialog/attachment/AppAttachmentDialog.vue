<template>
  <Dialog
    v-model:visible='visible'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header='headerTitle'
    @hide='emits("hide-dialog")'>

    <template #footer>
      <DialogFooter/>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DialogFooter from '@/common/components/dialog/DialogFooter.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { EcmFile } from '@/common/model/ecm';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['hide-dialog', 'select-files']);

const { t } = useI18n();

const visible = ref(props.dialogVisible);
const headerTitle = ref(props.header || t('common.attachment'));
const localFiles = ref<File[]>([]);
const ecmFiles = ref<EcmFile[]>([]);

const ecmPersonalFooterButtons = {
  closeButton: {
    icon: 'close',
    label: t('common.close'),
    text: true,
    severity: 'danger',
    type: 'button',
    command: () => emits('hide-dialog')
  },
  actionButton: {
    icon: 'check',
    label: t('common.select'),
    text: false,
    type: 'button',
    command: () => selectFiles()
  }
};
provide('dialogFooterButtons', ecmPersonalFooterButtons);

function selectFiles() {
  return {
    localFiles: localFiles.value,
    ecmFiles: ecmFiles.value
  };
}
</script>

<script lang='ts'>
export default { name: 'AppAttachmentDialog' };
</script>