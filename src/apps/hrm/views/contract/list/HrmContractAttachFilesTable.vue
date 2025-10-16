<template>
  <DataTable
    class='p-datatable-sm'
    responsive-layout='scroll'
    scroll-height='250px'
    scrollable
    show-gridlines
    striped-rows
    :value='attachment'>
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
      class='w-25rem'
      header='Tên giấy tờ'>
      <template #body='{ data }'>
        <p class='w-full'>{{ data.id ? data.fileName : data.name }}</p>
      </template>
    </Column>
    <Column
      class='w-18rem'
      :header='t(`book-ticket.bookFlight.attachment.table.fileName`)'>
      <template #body='{ data }'>
        <div class='align-items-center flex gap-2 justify-content-start'>
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
      <template #body='{index, data}'>
        <Button
          v-if='!isDetail'
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='showActionMenus($event, index)'></Button>

        <Button
          v-else
          icon='pi pi-download'
          rounded
          text
          @click='viewFile(data?.path)'></Button>
      </template>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import Column from 'primevue/column';
import { useI18n } from 'vue-i18n';

import { GATEWAY_URL } from '@/common/api/configService';
import { convertFileSize, getFileIcon, handleFileImageError } from '@/common/helpers/file-utils';

const props = defineProps<{
  attachment: any[] | undefined;
  isDetail: boolean
}>();

const emit = defineEmits<{
  (e: 'file-upload', event: Event, index: number): void;
  (e: 'show-action-menus', event: Event, index: number): void;
}>();

const { t } = useI18n();

function showActionMenus(event: Event, index: number) {
  emit('show-action-menus', event, index);
}

function viewFile(path: string) {
  window.open(
    GATEWAY_URL
      + '/files/preview/'
      + path,
  );
}
</script>
