<template>
  <div class='align-items-center flex font-semibold gap-3'>{{ t('hrm.contract.salary.bonus.title') }}
    <div
      class='p-2 p-button p-button-rounded p-button-text'
      @click='addBonus'>
      <i class='pi pi-plus-circle'></i>
    </div>
  </div>
  <DataTable
    v-if='modelReactive && modelReactive.length'
    edit-mode='cell'
    :pt='{
      column: {
        bodyCell: bodyCellFunc
      }
    }'
    :value='modelReactive'
    @cell-edit-complete='onCellEditComplete'>
    <Column
      class='w-30rem'
      field='type'
      :header='t("hrm.contract.salary.bonus.type")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #editor='{data, field}'>
        <Dropdown
          v-model='data[field]'
          autofocus
          class='p-inputtext-sm w-full'
          :options='bonusTypes'/>
      </template>
    </Column>
    <Column
      field='amount'
      :header='t("hrm.contract.salary.bonus.amount")'
      :pt='{
        headerContent: {
          class: "justify-content-start"
        }
      }'>
      <template #body='{data, field}'>
        {{ new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2 }).format(data[field] || 0,) }} VND
      </template>
      <template #editor='{data, field, editorSaveCallback}'>
        <InputNumber
          v-model='data[field]'
          autofocus
          class='p-inputtext-sm w-full'
          currency='VND'
          currency-display='code'
          locale='vi-VN'
          :min='0'
          :min-fraction-digits='2'
          mode='currency'
          @blur='(e)=>editorSaveCallback(e.originalEvent)'/>
      </template>
    </Column>
    <Column
      class='w-5rem'>
      <template #body='{index}'>
        <i
          class='cursor-pointer pi pi-trash text-red-500'
          @click='deleteBonus(index)'></i>
      </template>

    </Column>
  </DataTable>
  <template
    v-for='(bonus, index) in modelReactive'
    :key='index'>
    <input
      :name='`salary.bonuses[${ index }].id`'
      type='hidden'
      :value='bonus.id'/>
    <input
      :name='`salary.bonuses[${ index }].salaryId`'
      type='hidden'
      :value='bonus.salaryId'/>
    <input
      :name='`salary.bonuses[${ index }].type`'
      type='hidden'
      :value='bonus.type'/>
    <input
      :name='`salary.bonuses[${ index }].amount`'
      type='hidden'
      :value='bonus.amount'/>
  </template>
</template>

<script lang='ts' setup>
import { clone } from 'lodash';
import type { ColumnState } from 'primevue/column';
import type { DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingName } from '@/apps/hrm/helpers/utils';
import type { SalaryBonus } from '@/apps/hrm/model/contract';

const { t } = useI18n();
const model = defineModel({ type: Array as PropType<SalaryBonus[]> });
const modelReactive = reactive<SalaryBonus[]>(clone(model.value) || [] as SalaryBonus[]);

watch(model, (value) => {
  Object.assign(modelReactive, clone(value));
},
{ deep: true });
const bonusTypes = ref([]);

const bodyCellFunc = (e: { state: ColumnState }) => ({ class: { 'pt-0 pb-0': e.state['d_editing'] } });

function addBonus() {
  modelReactive.push({});
}

function deleteBonus(index: number) {
  modelReactive.splice(index, 1);
}

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  modelReactive[event.index] = event.newData as SalaryBonus;
}

onMounted(() => {
  fetchCategoryMappingName(CATEGORY_TYPE.ALLOWANCE, bonusTypes);
});
</script>

<style scoped>

</style>
