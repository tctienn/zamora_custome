<template>
  <DataTable
    v-model:selection='selectedRow'
    class='overflow-auto w-full'
    row-hover
    selection-mode='single'
    show-gridlines
    striped-rows
    style='max-height: unset'
    :value='receivingDocs'>
    <Column
      class='text-center'
      frozen
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      field='receivingDocName'
      :header='t(`hrm.receivingDoc.receivingDocName`)'
      style='min-width: 10vw'>
    </Column>
    <Column
      class='text-center'
      field='receivingDate'
      :header='t(`hrm.receivingDoc.receivingDate`)'
      style='min-width: 10vw'>
      <template #body='{ data: { receivingDate } }'>
        {{ receivingDate && moment(receivingDate).format('DD/MM/YYYY') }}
      </template>
    </Column>
    <Column
      field='files'
      :header='t(`hrm.receivingDoc.attachment`)'
      style='min-width: 10vw'>
      <template #body='{ data: { files } }'>
        <div
          v-if='files.length'
          class='align-items-center flex gap-2'
          @click='viewDetail(files[0])'>
          <img
            alt=''
            class='file-extension-icon h-2rem w-2rem'
            draggable='false'
            :src='getFileIcon(files[0].name.split(".")[files[0].name.split(".").length - 1])'
            @error='handleFileImageError'/>
          <div class='align-content-center word-break-break-word'>
            {{ files[0].name }}
          </div>
        </div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='files'
      :header='t(`hrm.receivingDoc.size`)'
      style='min-width: 7vw'>
      <template #body='{ data: { files } }'>
        <div
          v-if='files.length'>
          {{ files[0].size }}KB
        </div>
      </template>
    </Column>
    <Column
      field='receiver'
      :header='t(`hrm.receivingDoc.receiver`)'
      style='min-width: 7vw'>
      <template #body='{ data: { receiver } }'>
        <div
          v-if='receiver'
          class='align-items-center flex justify-content-center'>
          <AppGroupAvatar
            v-if='receiver'
            avatar-size='2.3'
            :user-ids='[receiver]'/>
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllEmployeeReceivingDocBySnapshotId } from '@/apps/hrm/api/graphql/employee-training-process';
import { viewPdfExportFileEmployee } from '@/apps/hrm/api/rest/employee';
import type { ReceivingDoc } from '@/apps/hrm/model/employee';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import {
  generateFilePreviewUrl,
  generatePreviewFileUrl,
  getFileIcon,
  getPreviewFile,
  handleFileImageError
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

const props = defineProps({
  snapshotId: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    default: null
  }
});
const { t } = useI18n();
const { moment } = useMoment();
const selectedRow = ref<ReceivingDoc>({} as ReceivingDoc);
const receivingDocs = ref<ReceivingDoc[]>([]);

const { onResult: getAllEmployeeReceivingDocBySnapshotIdResult } =
  getAllEmployeeReceivingDocBySnapshotId(
    props.snapshotId
  );

getAllEmployeeReceivingDocBySnapshotIdResult((res) => {
  receivingDocs.value = res.data.getAllEmployeeReceivingDocBySnapshotId;
});

function viewDetail(file: { path: string; name: string; extension: string }) {
  if (!file?.path) {
    return;
  }

  const fileUrl = generatePreviewFileUrl(file.path);
  if (!fileUrl) {
    return;
  }
  const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
  const isViewable = viewableExtensions.includes(file.extension.toLowerCase());

  if (isViewable) {
    window.open(fileUrl, '_blank');
  } else {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
</script>

<style scoped>

</style>