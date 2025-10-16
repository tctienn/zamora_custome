<template>
  <div class='flex gap-3'>
    <div>
      <Button
        class='min-w-max'
        icon='pi pi-upload'
        :label='t("common.upload")'
        @click='fileRef?.click()'/>
    </div>

    <input
      ref='fileRef'
      :accept="allowedFileTypes.join(',')"
      :multiple='multiple'
      :name='name'
      type='file'
      @change='handleFileChange'>

    <input
      hidden
      :name='oldIdsName'
      :value='oldFiles.map(file => file.id).join(",")'>

    <div
      class='files-list'>
      <div
        v-for='(file, index) in files'
        :key='index'
        class='border-round flex gap-2 p-2 surface-ground'>
        <img
          alt='extension'
          :src='`/images/file-extension-icons/${getFileExtension(file.name)}.svg`'
          style='width:1.75rem'>
        <div class='flex flex-column flex-grow-1'>
          <div>{{ file.name }}</div>
          <div>{{ convertFileSize(file.size) }}</div>
        </div>
        <Button
          icon='pi pi-times'
          rounded
          text
          @click='deleteFile(index)'></Button>
      </div>

      <div
        v-for='(file, index) in oldFiles'
        :key='index'
        class='border-round flex gap-2 p-2 surface-ground'>
        <img
          alt='extension'
          :src='`/images/file-extension-icons/${file.extension}.svg`'
          style='width:1.75rem'>
        <div class='flex flex-column flex-grow-1'>
          <a
            :href='generateDownloadUrl(file.path)'
            target='_blank'>{{ file.name }}</a>
          <div>{{ convertFileSize(file.size) }}</div>
        </div>
        <Button
          icon='pi pi-times'
          rounded
          text
          @click='deleteAttachment(index)'></Button>
      </div>
    </div>
  </div>

</template>

<script lang='ts' setup>
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { toastError } from '@/common/helpers/custom-toast-service';
import { convertFileSize, generateDownloadUrl } from '@/common/helpers/file-utils';
import { validateFilesCommon } from '@/common/helpers/validateFileOption';
import { allowedFileTypes } from '@/common/helpers/validateFileOption';

type Attachment = {
  name: string,
  size: number,
  extension: string,
  path: string,
  [key: string]: any
}

defineProps({
  name: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false
  },
  columnDisplay: {
    type: Number,
    default: 2
  },
  oldIdsName: {
    type: String,
    default: 'oldAttachmentIds'
  },
});

const oldFiles = defineModel('oldFiles', {
  type: Array as PropType<Attachment[]>,
  default: () => []
});
const fileRef = ref<HTMLInputElement>();
const files = ref<File[]>([]);
const { t } = useI18n();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target?.files) {
    const newFiles = Array.from(target.files);

    // validate trước
    const isValidFiles = validateFilesCommon([...files.value, ...newFiles]);
    if (isValidFiles.length > 0) {
      toastError({ message: isValidFiles[0] });
      return; // không push file lỗi
    }

    // nếu không lỗi thì mới thêm
    files.value = [...files.value, ...newFiles];
    syncFilesToInput();
  }
};

function syncFilesToInput() {
  const dataTransfer = new DataTransfer();
  files.value.forEach(file => dataTransfer.items.add(file));
  if (fileRef.value) {
    fileRef.value.files = dataTransfer.files;
  }
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop();
}

function arrayToFileList(filesArray: File[]): FileList {
  const dataTransfer = new DataTransfer();
  filesArray.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

function deleteFile(index: number) {
  const fileList = files.value;
  if (!fileList) {
    return;
  }

  const updatedFiles = Array.from(fileList);
  updatedFiles.splice(index, 1);
  files.value = files.value.filter((_, ind) => ind !== index);
}

function deleteAttachment(index: number) {
  if (!oldFiles.value) {
    return;
  }
  oldFiles.value = oldFiles.value.filter((_, i) => i !== index);
}

</script>

<style scoped>
input[type=file] {
  display: none;
}

.files-list {
  display: grid;
  grid-template-columns: repeat(v-bind(columnDisplay), auto);
  gap: .5rem;
}
</style>