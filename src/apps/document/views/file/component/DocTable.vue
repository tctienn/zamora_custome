<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    row-hover
    selection-mode='single'
    :value='listDocs'>
    <Column
      field='quote'
      header='Trích yếu'
      style='max-width: 40%'>
      <template #body='{ data: { quote } }'>
        <div
          class='overflow-hidden text-overflow-ellipsis'
          style='max-width: 300px'>
          {{ quote }}
        </div>
      </template>
    </Column>

    <Column
      class='text-center'
      field='docCode'
      :header="t('Số/Ký hiệu')"
      style='width: 15%'></Column>

    <Column
      class='text-center'
      field='docDate'
      header='Ngày của tài liệu'
      style='width: 15%'>
      <template #body='{ data: { docDate } }'>
        {{ moment(docDate).format('DD/MM/YYYY') }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='objectType'
      header='Loại'
      style='width: 15%'>
      <template #body='{ data: { objectType } }'>
        {{ docTypeLabel[objectType] }}
      </template>
    </Column>

    <Column
      class='text-center'
      field='status'
      header='Trạng thái'
      style='width: 15%'>
      <template #body='{ data: { status } }'>
        {{ t(`document.file.${status}`) }}
      </template>
    </Column>

    <Column
      class='text-center'
      :header="t('common.action')"
      style='width: 15%'>
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_horiz'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu({ event: $event, data: data })'/>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>
import Column from 'primevue/column';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { SORT_TYPE } from '@/apps/document/model/file';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { FilesSystemData } from '@/common/model/attachment';

const props = defineProps({
  listDocs: {
    type: Array as PropType<FilesSystemData[]>,
    default: () => [],
  },
  currentSort: {
    type: String,
    default: SORT_TYPE.DOC_NUM,
  },
});
const emits = defineEmits(['toggleActionMenu']);
const { moment } = useMoment();
const { t } = useI18n();
const selectedRow = ref<any>();
const docTypeLabel: Record<string, string> = {
  VB_DEN: 'Văn bản đến',
  VB_DI: 'Văn bản đi',
  PHIEU_TRINH: 'Phiếu trình',
};
const sortByField = <T extends keyof FilesSystemData>(
  field: T,
  isDate = false,
) => {
  return [...props.listDocs].sort((a, b) => {
    const valueA = isDate ? new Date(a[field] || 0).getTime() : a[field] || '';
    const valueB = isDate ? new Date(b[field] || 0).getTime() : b[field] || '';
    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
  });
};

const listDocs = computed(() => {
  switch (props.currentSort) {
  case SORT_TYPE.DOC_QUOTE:
    return sortByField('quote');
  case SORT_TYPE.DOC_DATE:
    return sortByField('docDate', true);
  case SORT_TYPE.DOC_TYPE:
    return sortByField('objectType');
  case SORT_TYPE.STATUS:
    return sortByField('status');
  default:
    return props.listDocs;
  }
});

function toggleActionMenu({
  event,
  data
}: { event: Event; data: any }) {
  emits('toggleActionMenu', [event, data]);
}
</script>

<style scoped></style>
