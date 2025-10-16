<template>
  <Dialog
    v-model:visible='visible'
    class='dialog-view-file'
    :header='`Xem file ${decisionName}`'
    modal
    :style="{ width: '80vw', height: '90vh' }">
    <div class='flex justify-content-end pb-1'>
      <Button
        icon='pi pi-download'
        label='Tải Word'
        @click='downloadDocx'/>
    </div>
    <div
      class='h-full w-full'
      style='display: flex'>
      <iframe
        v-if='fileUrl'
        :src='fileUrl'
        style='width: 100%; height: 100%; border: none'/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { ref, toRef, watch, watchEffect } from 'vue';

import { exportFileDecision } from '@/apps/hrm/api/rest/decision';
import { downloadFile } from '@/common/helpers/file-utils';

const props = defineProps<{
  modelValue: boolean;
  fileBlob?: Blob | null;
  decisionId: string;
  decisionName: string
}>();

const emit = defineEmits(['update:modelValue']);
const visible = ref(props.modelValue);
const fileUrl = ref<string | null>(null);
watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(() => visible.value, (val) => {
  emit('update:modelValue', val);
  if (!val && fileUrl.value) {
    URL.revokeObjectURL(fileUrl.value);
    fileUrl.value = null;
  }
});

const fileBlob = toRef(props, 'fileBlob');

watchEffect(() => {
  if (fileBlob.value instanceof Blob) {
    fileUrl.value = URL.createObjectURL(fileBlob.value);
  }
});

function downloadDocx() {
  exportFileDecision(props.decisionId)
    .then(file => {
      downloadFile(file!, `${props.decisionId}.docx`);
    });
}
</script>

<style>
.dialog-view-file .p-dialog-content {
  height: 100%;
}

.p-dialog.p-component .p-dialog-content {
  padding-top: 1rem
}
</style>