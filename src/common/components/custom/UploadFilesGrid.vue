<template>
  <div class='align-items-center flex justify-content-between pb-1 show-header'>
    <slot name='header'>
      <div
        class='align-items-center flex'>
        <AppIcon
          name='attach_file'
          size='1.5'
          text/>
        <label
          class='font-bold'>{{ t('Tệp đính kèm') }}</label>
      </div>

      <AppIcon
        v-if='!isView'
        ref='addFileRef'
        v-tooltip="'Chọn file đính kèm'"
        class='cursor-pointer text-primary'
        name='add_circle'
        size='1.5'
        @click='addFile()'/>
    </slot>

  </div>
  <input
    ref='inputFiles'
    hidden
    multiple
    :name='fileAttachmentsName'
    type='file'
    @change='onChangeFiles'/>
  <input
    hidden
    :name='filesDeletedName'
    :value='filesDeleted'>
  <div
    v-for='file of filterListFile'
    :key='file.id'
    class='align-items-center file-row flex hover:surface-hover p-2'>
    <div
      class='align-items-center cursor-pointer flex flex-1 gap-2'
      @click='handleShowFile(file)'>
      <img
        v-if='file.name'
        alt=''
        class='file-extension-icon h-2rem w-2rem'
        draggable='false'
        :src='getFileIcon(file.name.split(".")[file.name.split(".").length - 1])'
        @error='handleFileImageError'/>
      {{ file.name }}
    </div>
    <div
      v-if='file.size'
      class='w-6rem'>
      {{ convertFileSize(file?.size) }}
    </div>
    <div
      class='align-items-center flex gap-2 justify-content-end w-5rem'>
      <ButtonIcon
        v-if='file.id && file.path'
        v-tooltip.left='"Tải xuống"'
        class='btnAction'
        icon='download'
        icon-size='1.5'
        rounded
        text
        @click='downloadAttachment(file.name || "file.tmp", file.path)'/>

      <ButtonIcon
        v-if='!isView'
        v-tooltip.left='"Xóa"'
        class='btnAction'
        icon='delete'
        icon-size='1.5'
        rounded
        text
        @click='deleteFileAttach(file.id,file.name,file.size,file.extension)'/>
    </div>
  </div>

  <DialogPreviewFile
    v-if='visiblePreviewFile'
    :name='selectedFile.name'
    :url='selectedFile.path'
    :visible='visiblePreviewFile'
    @hide-dialog='visiblePreviewFile = false'/>
</template>

<script setup lang='ts'>
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import {
  convertFileSize,
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import type { Attachment } from '@/common/model/attachment';

const props = defineProps(
  {
    filesDeletedName: {
      type: String,
      default: 'filesDeleted'
    },
    fileAttachmentsName: {
      type: String,
      default: 'fileAttachments'
    },
    isView: {
      type: Boolean,
      default: false
    },
    filesDeleted: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    listFile: {
      type: Array as PropType<Attachment[]>,
      default: () => []
    }
  }
);
const emits = defineEmits(['update:filesDeleted', 'update:listFile']);

const filterListFile = computed(() => props.listFile?.filter(x => !x.isDeleted));
const inputFiles = ref();
const { t } = useI18n();
let fileList: FileList | undefined = undefined;
const selectedFile = ref<any>();
const visiblePreviewFile = ref(false);

function addFile() {
  inputFiles.value?.click();
}

function onChangeFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    const temp: Attachment[] = [];
    for (let f of files) {
      let fileAttachment: Attachment = {
        name: f.name,
        extension: f.type,
        size: f.size,
        isDeleted: false
      };
      temp.push(fileAttachment);
    }
    addNewFiles(files);
    emits('update:listFile', [...props.listFile || [], ...temp]);

  }
}

function deleteFileAttach(id: string | undefined, name: string | undefined, size: number | undefined, extension: string | undefined) {
  removeFiles(name, size, extension);
  if (id) {
    emits('update:listFile', props.listFile.map(f => {
      if (f.id == id) {
        return {
          ...f,
          isDeleted: true
        };
      }
      return f;
    }));
    emits('update:filesDeleted', [...props.filesDeleted, id]);
  } else {
    emits('update:listFile', props.listFile?.filter(x => x.name != name));
  }
}

function handleShowFile(file: any) {
  selectedFile.value = file;
  visiblePreviewFile.value = true;
}

function downloadAttachment(name: string, path: string) {
  const fileUrl = generateChatAttachmentDownloadUrl(path);
  if (fileUrl) {
    downloadFileUrl(fileUrl, name);
  }
}

function getCurrentFiles(): DataTransfer {
  const dataTransfer = new DataTransfer();
  if (fileList) {
    for (const file of fileList) {
      dataTransfer.items.add(file);
    }
  }
  return dataTransfer;
}

function addNewFiles(files: FileList) {
  const dataTransfer = getCurrentFiles();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  fileList = dataTransfer.files;
  inputFiles.value.files = fileList;
}

function removeFiles(name: string | undefined, size: number | undefined, type: string | undefined) {
  if (name && size && type) {
    const dataTransfer = getCurrentFiles();
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const f = dataTransfer.files[i];
      if (f.name === name && f.size === size && f.type === type) {
        dataTransfer.items.remove(i);
      }
    }
    fileList = dataTransfer.files;
    inputFiles.value.files = fileList;

  }
}

defineExpose({ addFile });
</script>

<script lang='ts'>
export default { name: 'UploadFilesGrid' };
</script>

<style scoped lang='scss'>
.file-row {
  &:hover {
    .btnAction {
      display: block;
    }
  }
}

.btnAction {
  display: none
}
</style>