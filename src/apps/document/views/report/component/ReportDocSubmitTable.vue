<template>
  <DataTable
    v-model:selection='selectedRows'
    :data-key="'id'"
    :meta-key-selection='false'
    selection-mode='multiple'
    :show-gridlines='true'
    :total-records='0'
    :value='[]'
    v-bind='DEFAULT_DATATABLE_CONFIG'>
    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {
          itemType: toLower(t('document.book.objectName')),
        })
      }}</span>
    </template>

    <Column
      field='bookName'
      :header="t('STT')"></Column>
    <Column
      field='bookName'
      :header="t('ID')"></Column>
    <Column
      field='bookName'
      :header="t('Số, ký hiệu văn bản')"></Column>
    <Column
      field='bookName'
      :header="t('Trích yếu nội dung văn bản')"></Column>
    <Column
      field='bookName'
      :header="t('Độ khẩn')"></Column>
    <Column
      field='bookName'
      :header="t('Hình thức văn bản')"></Column>
    <Column
      field='bookName'
      :header="t('Người ký')"></Column>
    <Column
      field='bookName'
      :header="t('Trạng thái văn bản')"></Column>
    <Column
      field='bookName'
      :header="t('Đối tượng đang chờ ký')"></Column>

    <Column
      field='bookName'
      :header="t('Ngày tạo')"></Column>

    <Column
      field='bookName'
      :header="t('Ngày trình')"></Column>

    <Column
      field='bookName'
      :header="t('Thời gian xử lý')"></Column>

    <Column
      field='bookName'
      :header="t('Trạng thái ban hành')"></Column>

    <Column
      field='bookName'
      :header="t('Thời gian ban hành')"></Column>

    <Column
      field='bookName'
      :header="t('Ý kiến phê duyệt')"></Column>

    <Column
      field='bookName'
      :header="t('File văn bản')"></Column>
  </DataTable>
</template>

<script lang='ts' setup>
import { toLower } from 'lodash';
import Column from 'primevue/column';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { BookInterface } from '@/apps/document/model/book';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';

const { t } = useI18n();
const selectedRows = ref<BookInterface[]>([]);
</script>

<style scoped></style>
