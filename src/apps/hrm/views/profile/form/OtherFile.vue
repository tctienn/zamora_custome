<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:40rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click="emits('hide-sidebar')"/>
          {{ t('hrm.profile.otherFile') }}
        </div>
      </div>
    </template>

    <div class='align-items-center flex justify-content-between mt-2'>
      <div class='font-bold'>{{ t('hrm.profile.docs') }}</div>
      <Button
        class='border-round-sm mb-2 min-w-max'
        icon='pi pi-upload'
        :label='t("common.upload")'
        @click='fileInputRef.click()'/>
      <input
        ref='fileInputRef'
        class='hidden'
        multiple
        type='file'
        @change='handleFileUpload'/>
    </div>
    <DataTable
      class='p-datatable-sm'
      responsive-layout='scroll'
      scroll-height='250px'
      scrollable
      show-gridlines
      striped-rows
      :value='attachments'>
      <template #empty>
        <p class='text-center'>{{ t('common.noData') }}</p>
      </template>
      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'
        style='width: 5%'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>
      <Column
        class='w-18rem'
        :header='t(`book-ticket.bookFlight.attachment.table.fileName`)'>
        <template #body='{ data }'>
          <div
            class='align-items-center cursor-pointer flex gap-2 justify-content-start'
            @click='viewFile(data?.path)'>
            <img
              v-if='data.name && data.id'
              alt=''
              class='file-extension-icon h-2rem w-2rem'
              draggable='false'
              :src='getFileIcon(data.name.split(".").pop())'
              @error='handleFileImageError'/>
            <img
              v-else-if='!data.id'
              alt=''
              class='file-extension-icon h-2rem w-2rem'
              draggable='false'
              :src='getFileIcon(data.file?.name.split(".").pop())'
              @error='handleFileImageError'/>
            <p class='mb-0 ml-2 text-center text-green-600'>{{ data.id ? data.name : data.file?.name }}</p>
          </div>
        </template>
      </Column>
      <Column
        body-class='justify-content-center text-center'
        :header='t(`book-ticket.bookFlight.attachment.table.fileSize`)'
        style='width: 8rem'>
        <template #body='{ data }'>
          <p v-if='data.size'>
            {{ data.size ? convertFileSize(data.size) : '0Kb' }}
          </p>
          <p v-else-if='data.file?.size'>
            {{ data.file.size ? convertFileSize(data.file.size) : '0Kb' }}
          </p>
        </template>
      </Column>
      <Column
        align-frozen='right'
        body-class='surface-card p-2 text-center'
        frozen
        style='width: 2rem'>
        <template #body='{data}'>
          <Button
            icon='pi pi-ellipsis-v'
            rounded
            text
            @click='showActionMenus($event, data)'></Button>
        </template>
      </Column>
    </DataTable>
    <Menu
      ref='actionMenusRef'
      :model='actionMenus'
      popup></Menu>
  </Sidebar>
</template>

<script setup lang='ts'>
import Column from 'primevue/column';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteProfileAttachmentById, findByEmployeeIdAndType } from '@/apps/hrm/api/graphql/employee';
import { uploadEmployeeFile } from '@/apps/hrm/api/rest/employee';
import { AttachmentType } from '@/apps/hrm/model/attachment';
import { GATEWAY_URL } from '@/common/api/configService';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  employeeId: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['hide-sidebar']);
const { t } = useI18n();
const visible = ref(props.visible);
const attachments = ref();
const actionMenus = ref<MenuItem[]>([]);
const actionMenusRef = ref<InstanceType<typeof Menu>>();
const fileInputRef = ref<any>();

const {
  onResult: findByEmployeeIdAndTypeResult,
  refetch: findByEmployeeIdAndTypeRefetch
} =
  findByEmployeeIdAndType(
    props.employeeId, [AttachmentType.PROFILE]
  );

findByEmployeeIdAndTypeResult((res) => {
  attachments.value = res.data?.findByEmployeeIdAndType;
});

const handleFileUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files || !props.employeeId) {
    return;
  }

  const formData = new FormData();
  formData.append('employeeId', props.employeeId);

  for (const file of files) {
    formData.append('files', file);
  }

  try {
    const res = await uploadEmployeeFile(formData);
    if (res) {
      findByEmployeeIdAndTypeRefetch();
    }
  } catch (err) {
    console.error('Upload failed:', err);
  }

  (event.target as HTMLInputElement).value = '';
};

const {
  mutate,
  onDone
} = deleteProfileAttachmentById();

const showActionMenus = (event: Event, data: any) => {
  actionMenus.value = [
    {
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => {
        confirmDelete(data);
      }
    }
  ];
  actionMenusRef.value?.toggle(event);
};

const confirm = useConfirm();

const confirmDelete = (data: any) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: data.name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      mutate({ id: data.id });
    },
  });
};

onDone(() => {
  toastSuccess({ message: t('common.deleteSuccess') });
  findByEmployeeIdAndTypeRefetch();
});

function viewFile(path: string) {
  window.open(
    GATEWAY_URL
    + '/files/preview/'
    + path,
  );
}
</script>

<style scoped>

</style>