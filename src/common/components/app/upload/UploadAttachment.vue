<template>
  <div class='flex flex-column'>
    <div class='column-gap-3 field flex flex-row mb-0'>
      <label>{{ title }}</label>
      <div class='align-items-start column-gap-1 flex flex-row'>
        <ButtonIcon
          v-tooltip='t("common.select")'
          class='mx-1 w-auto'
          :disabled='disabled'
          icon='add'
          rounded
          text
          @click='fileInput.click()'/>
        <ButtonIcon
          v-if='!disabled'
          v-tooltip='t("common.removeAll")'
          class='mx-1 w-auto'
          :disabled='!fileAttachments.length'
          icon='close'
          rounded
          severity='danger'
          text
          @click='confirmRemoveAllFile'/>
      </div>

      <input
        v-if='multiple'
        ref='fileInput'
        :accept='acceptFileTypes'
        class='hidden'
        :multiple='true'
        name='attachments'
        type='file'
        @change='inputFileChange'/>
      <input
        v-else
        ref='fileInput'
        :accept='acceptFileTypes'
        class='hidden'
        name='attachments'
        type='file'
        @change='inputFileChange'/>

    </div>

    <BlockUI
      v-if='fileAttachments.length'
      :blocked='blockOverlay'
      class='border-1 border-round p-2 surface-border'>
      <div
        v-if='fileAttachments.length'
        class='column-gap-3 flex flex-row flex-wrap'>
        <div
          v-for='{id, name, path, size} in fileAttachments'
          :key='id'
          class='align-items-center column-gap-2 flex flex-row w-full'>
          <ButtonIcon
            v-if='!disabled'
            v-tooltip.top="t('common.remove')"
            class='p-1 w-auto'
            icon='close'
            rounded
            severity='danger'
            text
            @click='confirmRemoveFile(id, name, size)'/>
          <label class='flex-grow-1 mb-1'>
            <a
              v-if='path'
              class='font-bold underline'
              :href='generateFileDownloadUrl(path)'>
              {{ `${name} (${convertFileSize(size)})` }}
            </a>
            <span v-else>{{ `${name} (${convertFileSize(size)})` }}</span>
          </label>
        </div>
      </div>
    </BlockUI>
  </div>
</template>

<script lang='ts' setup>
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Attachment } from '@/common/model';

import { convertFileSize, generateFileDownloadUrl } from '../../../helpers/file-utils';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  attachments: {
    type: Array as PropType<Attachment[]>,
    default: () => []
  },
  acceptFileTypes: {
    type: String,
    default: '*'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  objectId: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
});
const emits = defineEmits(['update-files']);

const { t } = useI18n();

const title = ref(props.title ?? t('common.attachment'));
const blockOverlay = ref(false);

const fileAttachments = ref<Attachment[]>(props.attachments);
const files = ref<FileList>();
const fileInput = ref();

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
  emits('update-files', fileAttachments.value, files.value);
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

function confirmRemoveAllFile() {
  files.value = undefined;
  fileAttachments.value = [];
  emitUpdateFiles();
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
export default { name: 'UploadAttachment' };
</script>

