<template>
  <div ref='drag'>
    <form
      ref='fileUpload'>
      <input
        name='folderId'
        type='hidden'
        :value='folderId'>
      <input
        ref='selectFilesInput'
        class='hidden max-h-0 max-w-0 opacity-0'
        multiple
        name='file'
        type='file'/>
    </form>
    <slot></slot>
  </div>
</template>

<script setup lang='ts'>
import type { AxiosProgressEvent } from 'axios';
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { MAX_FILE_SIZE } from '@/apps/ecm/constants';
import { validateFiles } from '@/apps/ecm/service/upload';
import { useStorageStore } from '@/apps/ecm/store/storage';
import { toastWarn } from '@/common/helpers/custom-toast-service';
import EventBus from '@/common/helpers/event-bus';
import { convertFileSize } from '@/common/helpers/file-utils';

const props = defineProps({
  uploadFunction: {
    type: Function as PropType<(form: HTMLFormElement | undefined, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void)) => void>,
    default: (form: HTMLFormElement | undefined, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void)) => void {}
  }
});
const {
  hasCreateAction,
  folderId
} = storeToRefs(useStorageStore());
const { t } = useI18n();
const drag = ref<HTMLElement>();
const selectFilesInput = ref<HTMLInputElement>();
const fileUpload = ref<HTMLFormElement>();

function dragenter() {
  drag.value?.classList.add('dragover');
}

function dragleave() {
  drag.value?.classList.remove('dragover');
}

function dragover(e: DragEvent) {
  e.preventDefault();
}

function drop(e: DragEvent) {
  e.preventDefault();
  drag.value?.classList.remove('dragover');
  if (selectFilesInput.value) {
    selectFilesInput.value.files = e.dataTransfer?.files ?? null;
    if (selectFilesInput.value?.files?.length && validate(selectFilesInput.value.files)) {
      props.uploadFunction(fileUpload.value,
        (progressEvent) => EventBus.emit('changeUploadProgress', (progressEvent.progress ?? 0) * 100));
    }
  }
}

function validate(files: FileList | null) {
  const isValid = validateFiles(files);
  if (!isValid) {
    toastWarn({ message: t('ecm.storage.someFilesExceedMaxFileSize', { maxFileSize: convertFileSize(MAX_FILE_SIZE) }) });
  }
  return isValid;
}

onMounted(() => {
  if (hasCreateAction.value) {
    drag.value?.addEventListener('dragenter', dragenter);
    drag.value?.addEventListener('dragover', dragover);
    drag.value?.addEventListener('dragleave', dragleave);
    drag.value?.addEventListener('drop', drop);
  }
});

onUnmounted(() => {
  if (hasCreateAction.value) {
    drag.value?.removeEventListener('dragstart', dragenter);
    drag.value?.removeEventListener('dragover', dragover);
    drag.value?.removeEventListener('dragleave', dragleave);
    drag.value?.removeEventListener('drop', drop);
  }
});
</script>

<script lang='ts'>

export default { name: 'DragUpload' };
</script>

<style scoped>
.dragover {
  border: var(--primary-color) dashed medium;
}
</style>