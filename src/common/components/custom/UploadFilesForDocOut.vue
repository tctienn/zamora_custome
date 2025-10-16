<template>
  <div class='align-items-end flex justify-content-between pb-1 show-header'>
    <slot name='header'>
      <div class='align-items-center flex font-semibold gap-1'>
        <i class='pi pi-paperclip'/>
        {{ props.header }}
      </div>

      <div class='flex gap-1'>
        <ButtonIcon
          v-if='!isView'
          class='border-round-sm'
          icon='upload'
          :label="t('common.uploadFile')"
          severity='warning'
          size='small'
          @click='addFile()'/>

        <ButtonIcon
          v-if='!isView'
          class='border-round-sm'
          icon='sell'
          :label="t('common.chooseInSystem')"
          size='small'
          @click='addFileInSystem()'/>
        <ButtonIcon
          v-if='!isView'
          class='border-round-sm'
          icon='create_new_folder'
          @click='chooseFromEcmDialogVisible = true'/>
      </div>
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
    class='border-1 border-round flex flex-column surface-border'>

    <div class='flex surface-ground'>
      <div class='align-content-center border-1 border-gray-300 font-semibold text-center w-5rem'>
        {{ t('common.ordinalNumber') }}
      </div>
      <div class='border-1 border-gray-300 col-4 font-semibold text-center'>{{ t('common.fileName') }}</div>
      <div class='border-1 border-gray-300 col-2 font-semibold text-center'>{{ t('common.size') }}</div>
      <div class='border-1 border-gray-300 col-3 font-semibold text-center'>{{ t('common.source') }}</div>
      <div class='border-1 border-gray-300 col font-semibold text-center'>{{ t('common.action') }}</div>
    </div>
    <div
      v-for='(file, index) of filterListFile'
      :key='file.id'
      class='align-items-center border-1 border-gray-300 file-row flex hover:surface-hover'>
      <div
        class='border-gray-300 border-right-1 col-1 surface-100 text-center w-5rem'
        style='height: 100%'>
        {{ index + 1 }}
      </div>
      <div class='align-items-center col-4 flex gap-2 py-0'>
        <img
          v-if='file.fullName'
          alt=''
          class='file-extension-icon h-2rem w-2rem'
          draggable='false'
          :src='getFileIcon(file.fullName.split(".")[file.fullName.split(".").length - 1])'
          @error='handleFileImageError'/>
        <div class='align-content-center word-break-break-word'>
          {{ file.fullName }}
        </div>
      </div>
      <div
        v-if='file.size'
        class='col-2 py-0 text-center'>
        {{ convertFileSize(file?.size) }}
      </div>

      <div
        class='col-3 flex justify-content-center py-0 text-center'>
        {{
          file.typeOfTake == TypeOfTake.REFERENT
            ? 'Trong hệ thống'
            : file.typeOfTake == TypeOfTake.ECM
              ? 'ECM'
              : file.typeOfTake == TypeOfTake.PRE_SIGN
                ? t('document.doc.signFile')
                : t('document.doc.uploadFile')
        }}
      </div>

      <div
        class='align-items-center col flex flex gap-2 justify-content-center py-0 text-center w-5rem'>
        <a
          v-if='canEdit && !isView && file.id && EDITABLE_FILE_TYPES.includes(file.fileExtension)'
          v-tooltip.left='"Chỉnh sửa bằng trình soạn thảo"'
          class='border-round-sm btnAction cursor-pointer text-primary'
          @click='editFile(file)'>
          <i class='pi pi-pencil'></i>
        </a>
        <ButtonIcon
          v-if='isView'
          v-tooltip.top='"Tải xuống"'
          class='border-round-sm btnAction'
          icon='download'
          icon-size='1.5'
          rounded
          text
          @click='file.id ? downloadAttachment(file.id) : undefined'/>
        <ButtonIcon
          v-if='isView'
          v-tooltip.top='t("ecm.dialog.saveToEcm")'
          class='border-round-sm btnAction'
          icon='cloud_download'
          icon-size='1.5'
          rounded
          text
          @click='openSaveToEcmDialog(file)'/>
        <ButtonIcon
          v-if='isView'
          v-tooltip.top='"Xem"'
          class='border-round-sm btnAction'
          icon='visibility'
          icon-size='1.5'
          rounded
          text
          @click='viewDetail(file.filePath, file.fileExtension)'/>

        <ButtonIcon
          v-if='!isView'
          v-tooltip.left='"Xóa"'
          class='border-round-sm btnAction'
          icon='delete'
          icon-size='1.5'
          rounded
          text
          @click='deleteFileAttach(file.id,file.fullName,file.size,file.fileExtension)'/>
      </div>
    </div>
  </div>
  <HostEditorDialog
    v-model:visible='editorVisible'
    :editor-url='generateFileDocumentEditorUrlWithoutToken(currentAttachment?.id || "")'/>

  <DialogFilesSystem
    v-if='visibleDialogFilesSystem'
    :visible='visibleDialogFilesSystem'
    @files='getFilesFromSystem'
    @hide-dialog='visibleDialogFilesSystem = false'/>
  <SaveToEcmDialog
    ref='ecmRef'
    v-model:visible='ecmDialogVisible'
    :filename='currentAttachment?.fullName'
    @chosen='saveToEcm'/>
  <ChooseFromEcmDialog
    v-model:visible='chooseFromEcmDialogVisible'
    @choose-files='chooseFileEcm'/>
</template>

<script lang='ts' setup>
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { downloadById } from '@/apps/document/api/rest/attachment';
import type { DocumentAttachment } from '@/apps/document/model/attachment';
import DialogFilesSystem from '@/apps/document/views/doc/doc-out/detail/DialogFilesSystem.vue';
import { EDITABLE_FILE_TYPES } from '@/apps/ecm/constants';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import SaveToEcmDialog from '@/apps/ecm/views/components/dialog/save/SaveToEcmDialog.vue';
import { GATEWAY_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import HostEditorDialog from '@/common/components/dialog/HostEditorDialog.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import {
  convertFileSize,
  downloadFile,
  generateDownloadUrl,
  generateFileDocumentEditorUrlWithoutToken,
  getFileIcon,
  handleFileImageError
} from '@/common/helpers/file-utils';
import { AttachType, TypeOfTake } from '@/common/model/attachment';

const props = defineProps(
  {
    maxHeight: {
      type: String,
      default: '11rem'
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
    canEdit: {
      type: Boolean,
      default: false
    },
    filesDeleted: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    listFile: {
      type: Array as PropType<DocumentAttachment[]>,
      default: () => []
    },
    fileTypeUploadName: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    fileUploadFromSystem: {
      type: Array as PropType<DocumentAttachment[]>,
      default: () => []
    },
    fileUploadFromEcm: {
      type: Array as PropType<DocumentAttachment[]>,
      default: () => []
    },
  }
);
const emits = defineEmits(['update:filesDeleted', 'update:listFile', 'update:fileTypeUploadName', 'update:fileUploadFromSystem', 'update:fileUploadFromEcm']);
const visibleDialogFilesSystem = ref(false);

const filterListFile = computed((): DocumentAttachment[] => props.listFile?.filter(x => !x.isDeleted));
const inputFiles = ref();
const currentAttachment = ref<DocumentAttachment>();
const editorVisible = ref(false);
const ecmDialogVisible = ref(false);
const chooseFromEcmDialogVisible = ref(false);
const ecmRef = ref<InstanceType<typeof SaveToEcmDialog>>();

function openSaveToEcmDialog(file: DocumentAttachment) {
  currentAttachment.value = file;
  ecmDialogVisible.value = true;
}

async function saveToEcm() {
  const url = generateDownloadUrl(currentAttachment.value?.filePath);
  if (url) {
    const blob = await baseApi.getWithFile<Blob>(url);
    if (blob) {
      ecmRef.value?.save(blob);
    } else {
      toastError({ message: t('ecm.storage.error.fileNotExits') });
    }
  }
}

function editFile(file: DocumentAttachment) {
  currentAttachment.value = file;
  editorVisible.value = true;
}

const { t } = useI18n();
let fileList: FileList | undefined = undefined;

function addFile() {
  inputFiles.value?.click();
}

function addFileInSystem() {
  visibleDialogFilesSystem.value = true;
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
    emits('update:fileTypeUploadName', temp.map(x => x.fullName));
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
    emits('update:fileUploadFromSystem', [...props.fileUploadFromSystem.filter((x) => x.id != id)]);
    emits('update:fileUploadFromEcm', [...props.fileUploadFromEcm.filter((x) => x.id != id)]);
  } else {
    emits('update:listFile', props.listFile?.filter(x => x.fullName != fullName));
    emits('update:fileUploadFromSystem', props.fileUploadFromSystem?.filter(x => x.fullName != fullName));
    emits('update:fileUploadFromEcm', props.fileUploadFromEcm?.filter(x => x.fullName != fullName));
  }
}

function downloadAttachment(id: string) {
  downloadById(id).then((res) => {
    if (res) {
      downloadFile(res.data, res.headers['content-disposition'] ? decodeURI(res.headers['content-disposition']
        .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)[1]
        .replaceAll('"', '')) : 'unknown');
    }
  });
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

function removeFiles(fullName: string | undefined, size: number | undefined, type: string | undefined) {
  if (fullName && size && type) {
    const dataTransfer = getCurrentFiles();
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const f = dataTransfer.files[i];
      if (f.name === fullName && f.size === size && f.type === type) {
        dataTransfer.items.remove(i);
      }
    }
    fileList = dataTransfer.files;
    inputFiles.value.files = fileList;
  }
}

function viewDetail(filePath: string | undefined, extension: string) {
  if (filePath) {
    if (EDITABLE_FILE_TYPES.includes(extension)) {
      window.open(GATEWAY_URL + '/files/preview/' + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'));
    } else {
      window.open(GATEWAY_URL + '/files/preview/' + filePath);
    }
  }
}

function getFilesFromSystem(data: any) {
  let dataTemp = data.map((file: any) => ({
    ...file,
    typeOfTake: TypeOfTake.REFERENT
  }));
  emits('update:listFile', [...props.listFile || [], ...dataTemp]);
  emits('update:fileUploadFromSystem', [...props.fileUploadFromSystem || [], ...dataTemp]);
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}

function chooseFileEcm(data: EcmFile[]) {
  let filesEcm = data.map((d: EcmFile) => ({
    fullName: d.name,
    size: d.size,
    typeOfTake: TypeOfTake.ECM,
    fileExtension: d.extension,
    fileName: '',
    filePath: d.treePath,
    attachType: AttachType.FILE_LIENQUAN,
    isDeleted: false,
    objectId: '',
    isCaSign: false,
    isDigitalSign: false,
    type: ''
  }));

  emits('update:listFile', [...props.listFile || [], ...filesEcm]);
  emits('update:fileUploadFromEcm', [...props.fileUploadFromEcm || [], ...filesEcm]);
}

defineExpose({ addFile });
</script>

<script lang='ts'>
export default { name: 'UploadFilesForDocOut' };
</script>

<style lang='scss' scoped>
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
