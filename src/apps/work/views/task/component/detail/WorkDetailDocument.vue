<template>
  <div>
    <!--  Header-->
    <DetailDocumentHeader
      v-model:view-type='viewType'
      class='my-1'
      :title="t('Tài liệu công việc')"
      @create-folder='createFolder'
      @document-upload='visibleDocUpload = true'
      @ecm-upload='ecmDialogVisible = true'
      @filter-file='filterFile'
      @on-search='onSearch'
      @upload-file='uploadFile'/>
    <!-- Body -->
    <DetailDocumentBody
      ref='detailDocumentBodyRef'
      v-model:search='searchRequest'
      :task-id='taskId'
      :view-type='viewType'/>

    <!-- Hidden File Input -->
    <input
      ref='selectFilesInput'
      :accept="ECM_FILE_ACCEPT.join(' ')"
      class='hidden max-h-0 max-w-0 opacity-0'
      multiple
      name='file'
      type='file'
      @change='upload'/>

    <!-- Modals -->
    <ChooseFromEcmDialog
      v-model:visible='ecmDialogVisible'
      @choose-files='handleEcmFiles'/>
    <SelectDocumentDialog
      v-model:visible='visibleDocUpload'
      @submit='handleDocumentFiles'/>
    <ConfirmDialog group='duplicateFile'>
      <template #message='{message}'>
        <i
          class='pr-4 text-4xl text-primary-500'
          :class='message.icon'></i>
        <span style='white-space: pre-line'>
          {{ message.message }}
        </span>

      </template>
    </ConfirmDialog>
  </div>
</template>

<script lang='ts' setup>
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ECM_FILE_ACCEPT } from '@/apps/ecm/constants';
import type { EcmFile } from '@/apps/ecm/model/file-folder';
import ChooseFromEcmDialog from '@/apps/ecm/views/components/dialog/choose/ChooseFromEcmDialog.vue';
import { uploadTaskAttachment } from '@/apps/work/api/rest/task-attachment';
import type { StatusType } from '@/apps/work/model/configWorkStatus';
import { type AttachmentSearch, OriginType, TaskAttachmentType, } from '@/apps/work/model/taskAttachment';
import DetailDocumentBody from '@/apps/work/views/task/component/detail/document/DetailDocumentBody.vue';
import DetailDocumentHeader from '@/apps/work/views/task/component/detail/document/DetailDocumentHeader.vue';
import SelectDocumentDialog from '@/apps/work/views/task/component/detail/document/SelectDocumentDialog.vue';
import type { DocAttachment } from '@/apps/work/views/task/component/detail/document/type';
import { toastErrorData } from '@/common/helpers/custom-toast-service';

const props = defineProps({
  taskId: {
    type: String,
    default: undefined
  }
});

// State
const { t } = useI18n();
const confirm = useConfirm();

const viewType = ref<'list' | 'grid'>('list');
const searchRequest = ref<AttachmentSearch>({ taskId: props.taskId || '' });
const selectFilesInput = ref<HTMLInputElement | null>(null);
const detailDocumentBodyRef = ref<InstanceType<typeof DetailDocumentBody> | null>(null);

const ecmDialogVisible = ref(false);
const visibleDocUpload = ref(false);

// Methods
function createFolder() {
  // TODO: Implement folder creation logic
}

function uploadFile() {
  selectFilesInput.value?.click();
  // fileUpload.value?.click();
}

function onSearch(searchTerm: string) {
  searchRequest.value = {
    ...searchRequest.value,
    keyword: searchTerm
  };
  detailDocumentBodyRef.value?.refetchData();
}

function upload(event: Event) {
  if (!selectFilesInput.value?.files) {
    return;
  }

  const formData = prepareFormData(OriginType.UPLOAD);
  appendFilesToFormData(formData, selectFilesInput.value.files);

  handleAttachmentUpload(formData, () => {
    (event.target as HTMLInputElement).value = '';
  });
}

function handleEcmFiles(files: EcmFile[]) {
  const formData = prepareFormData(OriginType.ECM);
  files.forEach((file, idx) => appendRefFileToFormData(formData, file, idx));

  handleAttachmentUpload(formData);
}

function handleDocumentFiles(files: DocAttachment[]) {
  const formData = prepareFormData(OriginType.DOCUMENT);
  files.forEach((file, idx) =>
    appendRefFileToFormData(formData, {
      id: file.attachment.id,
      extension: file.attachment.fileExtension,
      name: file.attachment.fullName,
      path: file.attachment.filePath,
      size: file.attachment.size,
    }, idx)
  );

  handleAttachmentUpload(formData, () => visibleDocUpload.value = false);
}

function filterFile(filter: string) {
  const promise = new Promise((resolve, reject) => {
    searchRequest.value = {
      ...searchRequest.value,
      origin: filter === 'ALL' ? undefined : [filter as OriginType],
    };
    resolve(true);
  });
  promise.then(() => {
    detailDocumentBodyRef.value?.refetchData();
  });
}

// Helper Functions
function prepareFormData(originType: OriginType): FormData {
  const formData = new FormData();
  if (props.taskId) {
    formData.append('taskId', props.taskId);
    formData.append('objectId', props.taskId);
  }
  formData.append('objectType', TaskAttachmentType.TASK);
  formData.append('originType', originType);
  return formData;
}

function appendFilesToFormData(formData: FormData, files: FileList) {
  Array.from(files).forEach((file) => formData.append('files', file));
}

function appendRefFileToFormData(formData: FormData, file: any, idx: number) {
  formData.append(`refFiles[${idx}].id`, file.id);
  formData.append(`refFiles[${idx}].name`, file.name);
  formData.append(`refFiles[${idx}].extension`, file.extension);
  formData.append(`refFiles[${idx}].path`, file.path);
  formData.append(`refFiles[${idx}].size`, file.size.toString());
}

function handleAttachmentUpload(formData: FormData, onSuccess?: () => void) {
  uploadTaskAttachment(formData)
    .then(() => {
      detailDocumentBodyRef.value?.refetchData();
      onSuccess?.();
    })
    .catch((reason) => {
      if (reason?.code === 'duplicateFilesName') {
        confirm.require({
          group: 'duplicateFile',
          header: t('common.confirm'),
          message: `Các tệp sau đã tồn tại. Tiếp tục thực hiện (Không ghi đè)? \n \n ${reason.message}`,
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            formData.append('forceSave', 'true');
            handleAttachmentUpload(formData, onSuccess);
          },
        });
      }
      handleError(reason);
    });
}

function handleError(error: Record<string, any>) {
  const data = {
    message: '',
    code: '',
  };
  if ((error?.code as string).startsWith('notAllow')) {
    data.message = 'Không có quyền thực hiện';
  }
  if ((error?.code as string).startsWith('taskAlready')) {
    const statusType: StatusType = (error?.data as Record<string, never>)?.statusType;
    data.message = `Công việc ở trạng thái ${t(`common.statuses.${(statusType as string).toLowerCase()}`)}, không thể thực hiện thao tác`;
  }
  toastErrorData({ error: { data: data } });
}
</script>

<style scoped></style>
