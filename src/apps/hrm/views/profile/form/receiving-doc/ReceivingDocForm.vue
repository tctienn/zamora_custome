<template>
  <Dialog
    v-model:visible='visibleForm'
    v-bind='DEFAULT_DIALOG_CONFIG'
    :header="t('hrm.receivingDoc.titleForm')"
    style='max-height: 70vh'
    @hide="emits('hide-dialog')">
    <form>
      <DataTable
        v-model:selection='selectedRows'
        class='h-full mb-6'
        row-hover
        scrollable
        :value='receivingDocuments'>
        <Column
          class='text-center'
          frozen
          header='#'
          style='width: 5%'>
          <template #body='slotProps'>
            <div
              class='align-items-center flex items-center justify-content-center'>
              {{ slotProps.index + 1 }}
            </div>
          </template>
        </Column>
        <Column
          header-style='width: 3rem'
          selection-mode='multiple'></Column>
        <Column
          field='receivingDocName'
          :header='t(`hrm.receivingDoc.receivingDocName`)'
          style='width: 30%'>
        </Column>
        <Column
          class='text-center'
          :header='t(`hrm.receivingDoc.receivingDate`)'
          style='width: 30%'>
          <template #body='slotProps'>
            <div v-if='selectedRows?.some((row: any) => row.receivingDocCode === slotProps.data.receivingDocCode)'>
              <Calendar v-model='slotProps.data.receivingDate'/>
            </div>
          </template>
        </Column>
        <Column
          class='text-center'
          :header='t(`hrm.receivingDoc.attachment`)'
          style='width: 30%'>
          <template #body='slotProps'>
            <div
              v-if='selectedRows?.some((row: any) => row.receivingDocCode === slotProps.data.receivingDocCode)'
              class='align-items-center flex justify-content-between'>
              <div></div>
              <div>
                <div
                  v-if='slotProps.data.attachment?.name'
                  class='align-items-center flex gap-2 justify-content-between'>
                  <img
                    alt=''
                    class='file-extension-icon h-2rem w-2rem'
                    draggable='false'
                    :src='getFileIcon(slotProps.data.attachment?.name.split(".")[slotProps.data.attachment?.name.split(".").length - 1])'
                    @error='handleFileImageError'/>
                  <div class='align-content-center word-break-break-word'>
                    {{ slotProps.data.attachment.name }}
                  </div>
                </div>
              </div>

              <div>
                <input
                  ref='fileInput'
                  class='hidden'
                  type='file'
                  @change='handleFileUpload($event)'/>

                <AppIcon
                  class='cursor-pointer'
                  name='attach_file'
                  size='1.5'
                  @click='triggerFileInput(slotProps.data.receivingDocCode)'/>

                <AppIcon
                  v-if='slotProps.data.attachment?.name'
                  class='cursor-pointer'
                  name='clear'
                  size='1.5'
                  @click='removeFile(slotProps.data)'/>
              </div>
            </div>
          </template>
        </Column>
      </DataTable>

      <div
        class='border-primary-100 border-top-1 bottom-0 fixed flex gap-2 justify-content-center p-3 py-2 surface-overlay'
        style='width: 96%'>
        <Button
          class='p-button-plain'
          icon='pi pi-times'
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-save'
          :label="t('common.save')"
          :loading='submitForm'
          @click='submit'/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang='ts'>

import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
import { saveEmployeeReceivingDoc } from '@/apps/hrm/api/rest/employee';
import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import type { ReceivingDoc } from '@/apps/hrm/model/employee';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DateTimeFormat, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  snapshotId: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  },
});
const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const form = ref<HTMLFormElement>();
const visibleForm = ref(props.visibleDialog);
const submitForm = ref(false);
const { moment } = useMoment();
const selectedRows = ref<ReceivingDoc[]>([]);
const currentCode = ref();

const receivingDocuments = ref([]);
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = (code: string) => {
  fileInput.value?.click();
  currentCode.value = code;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    const data = selectedRows.value?.find(item => item.receivingDocCode === currentCode.value);
    if (data) {
      data.attachment = file;
      data.isChangeAttachment = true;
      data.attachmentInfo = {
        fullName: file.name,
        fileExtension: file.type,
        size: file.size,
        isDeleted: false,
      };
    }
  }
};

const removeFile = (row: any) => {
  row.attachment = null;
};

const submit = async () => {
  if (selectedRows.value.length === 0) {
    return;
  }
  const formData = new FormData();
  selectedRows.value.forEach((row, index) => {
    formData.append(`list[${index}].receivingDocCode`, row.receivingDocCode ?? '');
    formData.append(`list[${index}].receivingDocName`, row.receivingDocName ?? '');
    formData.append(`list[${index}].snapshotId`, props.snapshotId ?? '');
    formData.append(`list[${index}].employeeId`, props.employeeId ?? '');
    formData.append(`list[${index}].isChangeAttachment`, String(row.isChangeAttachment ?? 'false'));
    formData.append(`list[${index}].receivingDate`, row.receivingDate ? moment(row.receivingDate).format(DateTimeFormat.ISO_LOCAL_DATE) : '');
    if (row.attachment instanceof File) {
      formData.append(`list[${index}].files`, row.attachment);
    }
  });
  await saveEmployeeReceivingDoc(formData).then(() => {
    toastSuccess({ message: 'Thêm giấy tờ thành công.' });
    emits('hide-dialog');
  });
};
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
getAllCategory(userDeptRole.value, CATEGORY_TYPE.RECEIVING_DOCUMENT).onResult((res) => {
  receivingDocuments.value = res.data.getAllCategory.map((item: any) => ({
    receivingDocCode: item.code,
    receivingDocName: item.name,
    receivingDate: null,
    attachment: null,
    attachmentInfo: null,
    isChangeAttachment: false,
  }));
});
</script>

<style scoped>

</style>