<template>
  <p class='font-bold title'>{{ t('hrm.evaluate.titleListOrganization')}}</p> 
  <DataTable
    class='p-datatable-gridlines p-datatable-md w-full'
    edit-mode='cell'
    :pt='{
      column: {
        bodyCell: bodyCellFunc
      }
    }'
    :value='listOrganizationValue'
    @cell-edit-complete='onCellEditComplete'>
    <Column
      class='px-2 text-center'
      header='STT'
      style='width: 2%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      class='w-30rem'
      field='type'
      :header='t("Tên")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #body='{ data }'>
        {{ data.evaluateEmployeeReportName }}
      </template>
    </Column>
    <Column
      class='w-30rem'
      field='aggregateByPositionCode'
      :header='t("hrm.evaluate.general.jobPositionCode")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #editor='{data, field}'>
        <div class='select-position'>
          <MultiSelect
            v-model='data[field]'
            autofocus
            class='w-full'
            filter
            :max-selected-labels='3'
            option-label='value'
            option-value='id'
            :options='jobPosition'
            @update:model-value='(vals: string[]) => {
              const foundNames = jobPosition.filter(p => vals.includes(p.id)).map(p => p.value);
              data.aggregateByPositionName = foundNames;
            }'/>
        </div>
      </template>
      <template #body='{ data }'>
        {{ data.aggregateByPositionName?.join(', ') }}
      </template>
    </Column>
    <Column
      class='text-center w-3rem'
      header=''>
      <template #body='{ data }'>
        <Checkbox
          v-model='data.selected'
          binary />
      </template>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import type { ColumnState } from 'primevue/column';
import type { DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { inject, onMounted, type PropType, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { ListOfEvaluateEmployeeReportOnEachOrganization } from '@/apps/hrm/model/evaluate';

const props = defineProps({
  listOrganization: {
    type: Array as PropType<ListOfEvaluateEmployeeReportOnEachOrganization[]>,
    default: () => []
  }
});

const emit = defineEmits(['update:listOrganization']);
const { t } = useI18n();
const listOrganizationInject = inject<Ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>>('listOrganization',
  ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>([])
);
const listOrganizationValue = ref(cloneDeep(props.listOrganization));
const jobPosition = ref<{id: string, value: string }[]>([]);

watch(listOrganizationInject, (newVal) => {
  if (!newVal || newVal.length === 0) {
    return;
  }
  const existingIds = new Set(listOrganizationValue.value.map(i => i.evaluateEmployeeReportId));
  const merged = [
    ...listOrganizationValue.value,
    ...newVal.filter(i => !existingIds.has(i.evaluateEmployeeReportId))
  ];
  listOrganizationValue.value = merged;
  emit('update:listOrganization', merged);
});

watch(listOrganizationValue, (newVal) => {
  emit('update:listOrganization', newVal);
}, { deep: true });
const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });
function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  listOrganizationValue.value[event.index] = event.newData as ListOfEvaluateEmployeeReportOnEachOrganization;
}

onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_POSITION, jobPosition, {
    labelProp: 'name',
    idProp: 'code'
  });

  if (listOrganizationInject.value?.length) {
    const merged = [...listOrganizationInject.value];
    listOrganizationValue.value = merged;
    emit('update:listOrganization', merged);
  }
});
</script>

<style scoped>
.title{
  color: #0F6CBD;
}
</style>
