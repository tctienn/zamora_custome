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
      <p class='text-center'>Không có dữ liệu</p>
    </template>

    <Column
      class='text-center'
      :header="t('common.ordinalNumber')"
      style='width: 5%'>
      <template #body='{ index }'>
        {{ index + 1 }}
      </template>
    </Column>

    <Column
      class='w-25rem'
      header='Tên file'>
      <template #body='{ data, index }'>
        <p v-if='!editIndexes.includes(index)'> {{ data.name }}</p>
        <InputText
          v-else
          v-model='data.name'
          class='w-full'
          placeholder='Nhập tên file'/>
      </template>
    </Column>

    <Column
      class='w-18rem'
      header='Tập tin đính kèm'>
      <template #body='{ data, index }'>
        <div class='align-items-center flex gap-2 justify-content-between'>
          <p class='mb-0 ml-2 text-center text-green-600'>
            {{ data.fileName ? data.fileName : data.file?.name }}
          </p>
          <div v-if='editIndexes.includes(index)'>
            <div>
              <input
                :ref='(el) => { fileInputs[index] = el as HTMLInputElement }'
                :accept="allowedTypes.join(',')"
                class='hidden'
                type='file'
                @change='(e) => handleFileUpload(e, index)'/>
              <ButtonIcon
                icon='attach_file'
                severity='warning'
                size='small'
                @click='fileInputs[index]?.click()'>
                {{ t('common.attachment') }}
              </ButtonIcon>
            </div>
          </div>
        </div>
      </template>
    </Column>

    <Column
      body-class='justify-content-center text-center'
      header='Kích thước'
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
      <template #body='{ index }'>
        <Button
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='showActionMenus($event, index)'></Button>
      </template>
    </Column>
  </DataTable>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
import { convertFileSize } from '@/common/helpers/file-utils';

const props = defineProps<{
  attachment: any[];
  editIndexes: number[];
  fileInputs: (HTMLInputElement | null)[];
}>();

const emit = defineEmits<{
  (e: 'file-upload', event: Event, index: number): void;
  (e: 'show-action-menus', event: Event, index: number): void;
}>();

const { t } = useI18n();

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
// 🔄 Gửi hàm validate ra ngoài component nếu cần

function handleFileUpload(event: Event, index: number) {
  emit('file-upload', event, index);
}

function showActionMenus(event: Event, index: number) {
  emit('show-action-menus', event, index);
}
</script>
