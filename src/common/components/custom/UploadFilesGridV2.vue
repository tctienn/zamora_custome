<template>
  <div class='align-items-center flex justify-content-between pb-1 show-header'>
    <slot name='header'>
      <div
        class='align-items-center flex font-semibold'>
        {{ props.header }}
      </div>

      <ButtonIcon
        v-if='!isView'
        icon='upload'
        :label="t('Tải tệp lên')"
        size='small'
        @click='addFile()'/>
    </slot>

  </div>
  <input
    ref='inputFiles'
    accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptz,.png, .gif, .jpg, .zip, .rar'
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
    class='border-1 border-round flex flex-column surface-border'
    :style='{"max-height": props.maxHeight}'>
    <table>
      <thead class='h-2rem opacity-80 surface-ground'>
        <tr>
          <th class='col-1'>STT</th>
          <th class='col-5'>Tên tệp</th>
          <th class='col-3'>Kích thước</th>
          <th class='col-3'>Thao tác</th>
        </tr>
      </thead>
    </table>
    <div class='overflow-y-scroll'>
      <div
        v-for='(file, index) of filterListFile'
        :key='file.id'
        class='align-items-center file-row flex hover:surface-hover p-2'>
        <div class='col-1 py-0 text-center'>
          {{ index + 1 }}
        </div>
        <div class='col-5 flex gap-2 py-0'>
          <img
            v-if='file.fullName'
            alt=''
            class='file-extension-icon h-2rem w-2rem'
            draggable='false'
            :src='getFileIcon(file.fullName.split(".")[file.fullName.split(".").length - 1])'
            @error='handleFileImageError'/>
          <div class='align-content-center'>
            {{ file.fullName }}
          </div>
        </div>
        <div
          v-if='file.size'
          class='col-3 py-0'>
          {{ convertFileSize(file?.size) }}
        </div>
        <div
          class='align-items-center col-3 flex flex gap-2 justify-content-center py-0 text-center w-5rem'>
          <ButtonIcon
            v-if='isView'
            v-tooltip.left='"Tải xuống"'
            class='btnAction'
            icon='download'
            icon-size='1.5'
            rounded
            text
            @click='downloadAttachment(file.fullName || "file.tmp", file.filePath)'/>
          <ButtonIcon
            v-if='isView'
            v-tooltip.left='"Xem"'
            class='btnAction'
            icon='visibility'
            icon-size='1.5'
            rounded
            text
            @click='viewDetail(file.filePath || "", file.fileExtension)'/>

          <ButtonIcon
            v-if='!isView'
            v-tooltip.left='"Xóa"'
            class='btnAction'
            icon='delete'
            icon-size='1.5'
            rounded
            text
            @click='deleteFileAttach(file.id,file.fullName,file.size,file.fileExtension)'/>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DocumentAttachment } from '@/apps/document/model/attachment';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import { GATEWAY_URL } from '@/common/api/configService';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import {
  convertFileSize,
  downloadFileUrl,
  generateChatAttachmentDownloadUrl,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import { type Attachment, AttachType } from '@/common/model/attachment';

const props = defineProps(
  {
    maxHeight: {
      type: String,
      default: '7rem'
    },
    header: {
      type: String,
      default: ''
    },
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
      type: Array as PropType<DocumentAttachment[]>,
      default: () => [] as Attachment[]
    }
  }
);

const emits = defineEmits(['update:filesDeleted', 'update:listFile']);

const filterListFile = computed<DocumentAttachment[]>(() => props.listFile?.filter(x => !x.isDeleted));
const inputFiles = ref();
const { t } = useI18n();
const fileList = defineModel<FileList | undefined>('fileList', { default: undefined });

// let fileList: FileList | undefined = undefined;

function addFile() {
  inputFiles.value?.click();
}

function onChangeFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    const temp: DocumentAttachment[] = [];
    for (const [index, file] of Array.from(files).entries()) {
      let fileAttachment: DocumentAttachment = {
        fullName: file.name,
        fileExtension: file.type,
        size: file.size,
        isDeleted: false,
        attachType: props.listFile.length == 0 && index == 0 ? AttachType.FILE_CHINH : AttachType.FILE_PHU
      };
      temp.push(fileAttachment);
    }
    addNewFiles(files);
    emits('update:listFile', [...props.listFile || [], ...temp]);
  }
}

function deleteFileAttach(id: string | undefined, fullName: string | undefined, size: number | undefined, extension: string | undefined) {
  removeFiles(fullName, size, extension);
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
    emits('update:listFile', props.listFile?.filter(x => x.fullName != fullName));
  }
}

function downloadAttachment(fullName: string, path: string | undefined) {
  const fileUrl = generateChatAttachmentDownloadUrl(path);
  if (fileUrl) {
    downloadFileUrl(fileUrl, fullName);
  }
}

function getCurrentFiles(): DataTransfer {
  const dataTransfer = new DataTransfer();
  if (fileList.value) {
    for (const file of fileList.value) {
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
  fileList.value = dataTransfer.files;
  inputFiles.value.files = fileList.value;
}

function removeFiles(fullName: string | undefined, size: number | undefined, type: string | undefined) {
  if (fullName && size && type) {
    const dataTransfer = getCurrentFiles();
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const f = dataTransfer.files[i];
      if (f.name === fullName && f.size === size && f.type === type) {
        dataTransfer.items.remove(i);
      }
    }
    fileList.value = dataTransfer.files;
    inputFiles.value.files = fileList.value;

  }
}

function viewDetail(filePath: string, extension: string) {
  if (EDITABLE_FILE_TYPES.includes(extension)) {
    window.open(GATEWAY_URL + '/files/preview/' + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'));
  } else {
    window.open(GATEWAY_URL + '/files/preview/' + filePath);
  }
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}

defineExpose({ addFile, });
</script>

<script lang="ts">
export default { name: 'UploadFilesGridV2' };
</script>

<style lang="scss" scoped>
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
