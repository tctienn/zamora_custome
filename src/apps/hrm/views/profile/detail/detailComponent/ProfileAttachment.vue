<template>
  <div class='w-full'>
    <div class='font-bold mb-2'>{{ t('hrm.profile.docs') }}</div>
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
    </DataTable>
  </div>

</template>

<script setup lang='ts'>

import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { findByEmployeeIdAndType } from '@/apps/hrm/api/graphql/employee';
import { AttachmentType } from '@/apps/hrm/model/attachment';
import { GATEWAY_URL } from '@/common/api/configService';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps({
  employeeId: {
    type: String,
    default: ''
  }
});
const { t } = useI18n();
const attachments = ref();

const { onResult: findByEmployeeIdAndTypeResult } =
  findByEmployeeIdAndType(
    props.employeeId, [AttachmentType.PROFILE]
  );

findByEmployeeIdAndTypeResult((res) => {
  attachments.value = res.data?.findByEmployeeIdAndType;
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