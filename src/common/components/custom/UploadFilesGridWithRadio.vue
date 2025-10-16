<template>
  <div class='align-items-end flex justify-content-between pb-2 show-header'>
    <slot name='header'>
      <div
        class='align-items-center flex font-semibold gap-2'>
        <i class='pi pi-paperclip'/>
        {{ props.header }}
        <label
          v-if='canEdit'
          v-required></label>
      </div>

      <input
        v-model='renameFiles'
        hidden
        name='renameFiles'/>
      <div>
        <ButtonIcon
          v-if='!isView'
          class='border-round-sm'
          icon='upload'
          :label="t('common.uploadFile')"
          severity='warning'
          size='small'
          style='height: 31px;'
          @click='addFile()'/>

        <ButtonIcon
          v-if='!isView && props.docType == DocTypeEnum.VB_DI'
          class='border-round-sm ml-1'
          icon='upload'
          :label="t('common.chooseTemplate')"
          size='small'
          style='height: 31px;'
          @click='showDialogDocTemplate()'/>

        <ButtonIcon
          v-if='!isView'
          v-tooltip.left='`Chọn file từ MyBox`'
          class='border-round-sm ml-2'
          icon='create_new_folder'
          severity='secondary'
          size='small'
          style='height: 31px;'
          @click='showChooseFromEcm()'/>
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
    :value='filesDeleted'/>

  <DataTable
    :class='["files-datatable", { "view-mode": isView }]'
    responsive-layout='scroll'
    :scroll-height='props.maxHeight'
    :scrollable='true'
    :show-gridlines='true'
    :striped-rows='false'
    :value='filterListFile'>

    <!-- STT Column -->
    <Column
      body-style='max-width: 2rem; width: 2rem; text-align: center; background: var(--surface-100);'
      :header='t("common.ordinalNumber")'
      header-style='max-width: 2rem; width: 2rem; text-align: center;'>
      <template #body='{ index }'>
        {{ index + 1 }}
      </template>
    </Column>

    <!-- File Name Column -->
    <Column
      body-style='width: 50%; padding: 0.5rem;'
      :header='t("common.fileName")'
      header-style='width: 50%; text-align: center;'>
      <template #body='{ data }'>
        <div class='align-items-center flex gap-2'>
          <img
            v-if='data.fullName'
            alt=''
            class='file-extension-icon flex-shrink-0 h-2rem w-2rem'
            draggable='false'
            :src="
              getFileIcon(
                data.fullName.split('.')[data.fullName.split('.').length - 1],
              )
            "
            @error='handleFileImageError'/>
          <div class='file-name word-break-break-word'>
            {{ data.fullName }}
          </div>
        </div>
      </template>
    </Column>

    <!-- File Size Column -->
    <Column
      body-style='width: 8rem; text-align: center;'
      :header='t("common.size")'
      header-style='width: 8rem; text-align: center;'>
      <template #body='{ data }'>
        <span v-if='data.size'>{{ convertFileSize(data?.size) }}</span>
      </template>
    </Column>

    <!-- Main File Column -->
    <Column
      body-style='width: 7rem; text-align: center;'
      :header='t("common.fileMain")'
      header-style='width: 7rem; text-align: center;'>
      <template #body='{ data }'>
        <RadioButton
          v-if='!isView'
          v-model='data.attachType'
          name='menuMode'
          value='FILE_CHINH'
          @click='onChangeAttachType(data)'></RadioButton>

        <AppIcon
          v-if='isView && data.attachType == AttachType.FILE_CHINH'
          class='text-green-600'
          name='check'
          size='1.5'
          text/>
      </template>
    </Column>

    <!-- Actions Column -->
    <Column 
      body-style='width: 5rem; text-align: center;'
      :header='t("common.action")'
      header-style='width: 5rem; text-align: center;'>
      <template #body='{ data, index }'>
        <div class='action-menu-container'>
          <Button
            class='p-button-rounded p-button-text'
            icon='pi pi-ellipsis-v'
            severity='secondary'
            @click='toggleActionMenu($event, data)'/>
        </div>
      </template>
    </Column>
  </DataTable>
  <HostEditorDialog
    v-model:visible='editorVisible'
    :editor-url='generateFileDocumentEditorUrlWithoutToken(currentAttachment?.id || "")'/>
  <DocTemplateDialog
    v-if='visibleDialog'
    :visible-dialog='visibleDialog'
    @choose-template='getTemplate'
    @hide-dialog='hideDocTemplateDialog'/>

  <DialogRenameFile
    v-if='visibleDialogRename'
    :file='toggleFile'
    :visible='visibleDialogRename'
    @hide-dialog='visibleDialogRename = false'
    @save-name='updateFileName'/>

  <SaveToEcmDialog
    ref='ecmRef'
    v-model:visible='ecmDialogVisible'
    :filename='currentAttachment?.fullName'
    @chosen='saveToEcm'/>

  <ChooseFromEcmDialog
    v-model:visible='showChooseFromEcmDialog'
    @choose-files='chooseFileEcm'/>

  <!-- Single Menu for all actions -->
  <Menu
    ref='actionMenu'
    :model='menuItems'
    :popup='true'/>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql, getRootGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getByTypeGraphql, getRootOrganizationGraphql } from '@/apps/document/api/graphql/organization';
import { downloadById } from '@/apps/document/api/rest/attachment';
import { type DocumentAttachment } from '@/apps/document/model/attachment';
import { DocTypeEnum } from '@/apps/document/model/docInBook';
import { OrganizationType } from '@/apps/document/model/organization';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import DocTemplateDialog from '@/apps/document/views/doc/doc-out/component/DocTemplateDialog.vue';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import { openFileToEdit } from '@/apps/ecm/service/action-file-folder';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import SaveToEcmDialog from '@/apps/ecm/views/components/dialog/save/SaveToEcmDialog.vue';
import { GATEWAY_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import AppIcon from '@/common/components/app/AppIcon.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import DialogRenameFile from '@/common/components/custom/DialogRenameFile.vue';
import HostEditorDialog from '@/common/components/dialog/HostEditorDialog.vue';
import { toastError } from '@/common/helpers/custom-toast-service';
import {
  convertFileSize,
  downloadFile,
  generateDownloadUrl,
  generateFileDocumentEditorUrlWithoutToken, generateFileEditorUrl,
  getFileIcon,
  handleFileImageError,
} from '@/common/helpers/file-utils';
import { type Attachment, AttachType, TypeOfTake } from '@/common/model/attachment';

const props = defineProps({
  docType: {
    type: String as PropType<DocTypeEnum>,
    default: DocTypeEnum.VB_DI
  },
  maxHeight: {
    type: String,
    default: '12rem',
  },
  header: {
    type: String,
    default: '',
  },
  filesDeletedName: {
    type: String,
    default: 'filesDeleted',
  },
  fileAttachmentsName: {
    type: String,
    default: 'fileAttachments',
  },
  isView: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  filesDeleted: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  listFile: {
    type: Array as PropType<DocumentAttachment[]>,
    default: () => [] as Attachment[],
  },
  fileUploadFromEcm: {
    type: Array as PropType<DocumentAttachment[]>,
    default: () => []
  },
});

const emits = defineEmits(['update:filesDeleted', 'update:listFile', 'update:fileUploadFromEcm']);
const { t } = useI18n();
const visibleDialog = ref(false);
const visibleDialogRename = ref(false);
const toggleFile = ref<DocumentAttachment>();
const renameFiles = ref<string[]>([] as string[]);
const currentAttachment = ref<DocumentAttachment>();
const editorVisible = ref(false);
const ecmDialogVisible = ref(false);
const ecmRef = ref<InstanceType<typeof SaveToEcmDialog>>();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const rootOrganizationCode = ref<string>('');
const orgs = ref<{ label: string, value: string, code: string }[]>([]);

// Menu functionality
const actionMenu = ref();
const currentFile = ref<DocumentAttachment>();

// Constant menu items
const menuItems: MenuItem[] = [
  {
    key: 'open',
    label: t('ecm.storage.fileFolderActions.open'),
    icon: 'pi pi-file-edit',
    visible: !props.isView,
    command: () => editFile(currentFile.value as DocumentAttachment)
  },
  {
    label: t('common.viewDetail'),
    icon: 'pi pi-eye',
    command: () => {
      if (currentFile.value?.filePath) {
        // File exists on server - use existing viewDetail function
        viewDetail(currentFile.value.filePath, currentFile.value.fileExtension);
      } else if (currentFile.value?.id) {
        // Handle files that have id but no filePath - generate preview URL or open file directly
        window.open(GATEWAY_URL + '/files/main/' + currentFile.value.id);
      } else if (currentFile.value?.fullName) {
        // Handle locally uploaded files - find in FileList and create object URL
        viewLocalFile(currentFile.value.fullName, currentFile.value.size);
      }
    }
  },
  {
    label: t('common.delete'),
    icon: 'pi pi-trash',
    visible: !props.isView,
    command: () => {
      if (currentFile.value) {
        deleteFileAttach(
          currentFile.value.id,
          currentFile.value.fullName,
          currentFile.value.size,
          currentFile.value.fileExtension,
          currentFile.value.attachType as AttachType
        );
      }
    }
  }
];

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

if (userDeptRole.value.type == OrganizationType.ADMINISTRATIVE) {
  getRootGraphql().onResult(async (res) => {
    rootOrganizationCode.value = await res.data?.getRoot[0]?.code;
  });
  getAllOrganizationPublicGraphql().onResult((res) => orgs.value = res.data.allOrganizationPublic.map((o: any) => ({
    label: o.name,
    value: o.id,
    code: o.code
  })));
} else if (userDeptRole.value.type == OrganizationType.PARTY) {
  getRootOrganizationGraphql(OrganizationType.PARTY).onResult(async (res) => {
    rootOrganizationCode.value = await res.data?.getRoot[0]?.code;
  });
  getByTypeGraphql(OrganizationType.PARTY).onResult((res) => orgs.value = res.data.getByType.map((o: any) => ({
    label: o.name,
    value: o.id,
    code: o.code
  })));
} else {
  getRootOrganizationGraphql(OrganizationType.UNION).onResult(async (res) => {
    rootOrganizationCode.value = await res.data?.getRoot[0]?.code;
  });
  getByTypeGraphql(OrganizationType.UNION).onResult((res) => orgs.value = res.data.getByType.map((o: any) => ({
    label: o.name,
    value: o.id,
    code: o.code
  })));
}

function editFile(file: DocumentAttachment) {
  currentAttachment.value = file;
  editorVisible.value = true;
}

function showDialogDocTemplate() {
  visibleDialog.value = true;
}

function hideDocTemplateDialog() {
  visibleDialog.value = false;
}

function renameAttachment(file: DocumentAttachment) {
  visibleDialogRename.value = true;
  toggleFile.value = file;
}

const filterListFile = computed<DocumentAttachment[]>(() =>
  props.listFile?.filter((x) => !x.isDeleted),
);
const inputFiles = ref();
let fileList: FileList | undefined = undefined;

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
        attachType:
            props.listFile.length == 0 && index == 0
              ? AttachType.FILE_CHINH
              : AttachType.FILE_PHU,
      };
      temp.push(fileAttachment);
    }
    addNewFiles(files);
    emits('update:listFile', [...props.listFile || [], ...temp]);
  }
}

function onChangeAttachType(file: DocumentAttachment) {
  emits(
    'update:listFile',
    props.listFile.map((fi) => {
      if (fi.fullName === file.fullName && fi.size === file.size) {
        fi = {
          ...fi,
          attachType: AttachType.FILE_CHINH,
        };
      } else {
        fi = {
          ...fi,
          attachType: AttachType.FILE_PHU,
        };
      }
      return fi;
    }),
  );
}

function updateFileName(file: any) {
  if (file.type != 'Template') {
    renameFiles.value.push(`${file.id}:${file.fullName}`);
  }
  let files = cloneDeep(props.listFile).filter((f: DocumentAttachment) => f.id != file.id);
  emits('update:listFile', [...files || [], ...[file]]);
  visibleDialogRename.value = false;
}

function deleteFileAttach(
  id: string | undefined,
  fullName: string | undefined,
  size: number | undefined,
  extension: string | undefined,
  attachType: AttachType
) {
  if (attachType == AttachType.FILE_CHINH) {
    toastError({ message: 'Bạn không thể xóa file chính.' });
    return;
  }
  removeFiles(fullName, size, extension);
  if (id) {
    emits(
      'update:listFile',
      props.listFile.map((f) => {
        if (f.id == id) {
          return {
            ...f,
            isDeleted: true,
          };
        }
        return f;
      }),
    );

    emits('update:filesDeleted', [...props.filesDeleted, id]);
  } else {
    emits(
      'update:listFile',
      props.listFile?.filter((x) => x.fullName != fullName),
    );
  }
}

function downloadAttachment(id: string, rootOrg?: string) {
  downloadById(id, rootOrg).then((res) => {
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

function removeFiles(
  fullName: string | undefined,
  size: number | undefined,
  type: string | undefined,
) {
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

function viewDetail(filePath: string, extension: string) {
  // if (EDITABLE_FILE_TYPES.includes(extension)) {
  window.open(
    GATEWAY_URL
      + '/files/preview/'
      + filePath
      // + changeFileExtension(filePath.replace('main', 'preview'), 'pdf'),
  );
  // }
  // else {
  //   console.log('2', extension);
  //   window.open(GATEWAY_URL + '/files/main/' + filePath);
  // }
}

// Function to view locally uploaded files
function viewLocalFile(fileName: string, fileSize?: number) {
  if (!fileList) {
    toastError({ message: 'No files available to view.' });
    return;
  }

  // Find the file in the FileList
  let targetFile: File | null = null;
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (file.name === fileName && (!fileSize || file.size === fileSize)) {
      targetFile = file;
      break;
    }
  }

  if (!targetFile) {
    toastError({ message: 'File not found in upload queue.' });
    return;
  }

  // Create object URL and open in new tab
  const objectUrl = URL.createObjectURL(targetFile);
  const newWindow = window.open(objectUrl, '_blank');
  
  // Clean up object URL after a delay to allow the window to load
  if (newWindow) {
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  } else {
    // If popup was blocked, clean up immediately
    URL.revokeObjectURL(objectUrl);
    toastError({ message: 'Unable to open file. Please check popup blocker settings.' });
  }
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}

function getTemplate(data: any) {
  const existFileMain = props.listFile.some((item: DocumentAttachment) => item.attachType == AttachType.FILE_CHINH);
  emits('update:listFile', [...props.listFile || [], ...data.map((d: any) => ({
    ...d,
    type: 'Template',
    attachType: existFileMain ? AttachType.FILE_PHU : AttachType.FILE_CHINH
  }))]);
}

// Menu functionality
function toggleActionMenu(event: Event, file: DocumentAttachment) {
  // Set the current file for menu commands
  currentFile.value = file;

  // Toggle the menu - visibility logic is handled by menu items' visible property
  if (actionMenu.value) {
    actionMenu.value.toggle(event);
  }
}

const showChooseFromEcmDialog = ref(false);
const showChooseFromEcm = () => {
  showChooseFromEcmDialog.value = true;
};

const chooseFileEcm = (data: EcmFile[]) => {
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
};

defineExpose({ addFile });
</script>

<script lang='ts'>
export default { name: 'UploadFilesGridWithRadio' };
</script>

<style lang='scss' scoped>
.files-datatable {
  :deep(.p-datatable-tbody > tr) {
    &:hover {
      .btnAction {
        display: block !important;
      }

      .file-name {
        color: #0F6CBDD6;
      }
    }
  }

  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.5rem;
    vertical-align: middle;
  }

  // Hide action buttons by default
  .btnAction {
    display: none;
  }

  // Always show action buttons in view mode
  &.view-mode {
    .btnAction {
      display: block;
    }
  }
}

.action-buttons {
  min-height: 2rem;
  flex-wrap: wrap;
}

.file-name {
  word-break: break-word;
  line-height: 1.2;
}

.file-extension-icon {
  object-fit: contain;
}
</style>
