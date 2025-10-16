<template>
  <div class='align-items-center flex flex-column w-full'>
    <Button
      v-if='!disableButton'
      class='w-8rem'
      :label='$t("common.upload")'
      size='small'
      @click='fileRef.click()'/>
    <input
      ref='fileRef'
      multiple
      type='file'
      v-bind='$attrs'
      @change='inputFileChange'>
    <div>
      <div
        v-for='{id, path, name, size} of fileAttachments'
        :key='id'
        class='align-items-center flex'>
        <ButtonIcon
          v-if='!disableButton'
          v-tooltip.top="t('common.remove')"
          class='p-1 w-auto'
          icon='close'
          rounded
          severity='danger'
          text
          @click='confirmRemoveFile(id, name, size)'/>
        <a
          v-if='path'
          class='link w-full'
          download
          :href='generateFileDownloadUrl(path)'>
          {{ name }}
        </a>
        <span v-else>{{ `${name}` }}</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generateFileDownloadUrl } from '@/common/helpers/file-utils';
import type { Attachment } from '@/common/model';

const props = defineProps({
  attachments: {
    type: Array as PropType<Attachment[]>,
    required: true,
    default: () => []
  },

  objectId: {
    type: String,
    required: false,
    default: ''
  },

  disableButton: {
    type: Boolean,
    required: false,
    default: false
  },

  filesNotUploadYet: {
    type: Object as PropType<FileList>,
    default: () => ({} as PropType<FileList>)
  }
});

const emits = defineEmits(['updateFiles']);

const { t } = useI18n();

const fileAttachments = ref<Attachment[]>(props.attachments);
const files = ref<FileList>();
const fileRef = ref();

function inputFileChange(event: Event) {
  const inputFiles = (event.target as HTMLInputElement).files;
  if (inputFiles) {
    const time = new Date().getTime();
    fileAttachments.value = [...fileAttachments.value,
      ...Array.from(inputFiles).map((f, i) => {
        return {
          id: `${time}_${i}`,
          name: f.name,
          size: f.size,
          isNew: true,
          objectId: props.objectId
        };
      })];
    pushFileList(inputFiles);
    emitUpdateFiles();
  }
}

function emitUpdateFiles() {
  emits('updateFiles', fileAttachments.value, files.value);
}

function dataTransferFromRef() {
  const dataTransfer = new DataTransfer();
  if (files.value) {
    for (const file of files.value) {
      dataTransfer.items.add(file);
    }
  }
  return dataTransfer;
}

function pushFileList(inputFiles: FileList) {
  const dataTransfer = dataTransferFromRef();
  for (const file of inputFiles) {
    dataTransfer.items.add(file);
  }
  files.value = dataTransfer.files;
}

function confirmRemoveFile(id: string | undefined, name: string, size: number) {
  fileAttachments.value = fileAttachments.value.filter(f => f.id !== id);

  const dataTransfer = dataTransferFromRef();
  for (let i = 0; i < dataTransfer.files.length; i++) {
    const f = dataTransfer.files[i];
    if (f.name === name && f.size === size) {
      dataTransfer.items.remove(i);
    }
  }
  files.value = dataTransfer.files;

  emitUpdateFiles();
}

watch(() => props.attachments, (newValue) => {
  fileAttachments.value = newValue;
});

</script>

<script lang='ts'>
export default { name: 'ButtonUpload', };
</script>

<style scoped>
input[type=file] {
  display: none;
}

</style>