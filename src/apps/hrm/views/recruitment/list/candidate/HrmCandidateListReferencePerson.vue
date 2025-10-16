<template>
  <div class='align-items-center flex justify-content-between mb-2'>  
    <p class='font-bold'>{{ t('hrm.candidate.referencePersons.title')}}</p> 
    <Button
      icon='pi pi-plus'
      @click='addRow' />
  </div>
  <div>
    <DataTable
      v-model:editingRows='editingRows'
      data-key='id'
      edit-mode='row'
      striped-rows
      style='max-height: unset'
      :value='referencePersonValue'
      @row-edit-save='onRowEditSave'>
      <Column
        class='px-2 text-center'
        header='TT'
        style='width: 2%'>
        <template #body='slotProps'>
          <div
            class='align-items-center flex items-center justify-content-center'>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='fullName'
        :header="t('hrm.candidate.general.fullName')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='companyName'
        :header="t('hrm.candidate.workExperience.companyName')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-1'
        field='jobPositionCode'
        :header="t('hrm.candidate.referencePersons.jobPositionCode')">
        <template #editor='{ data, field }'>
          <Dropdown
            v-model='data[field]'
            class='w-full'
            option-label='value'
            option-value='id'
            :options='positions'
            placeholder='Chọn chức vụ'/>
        </template>
        <template #body='{ data }'>
          {{ positions.find(p => p.id == data.jobPositionCode)?.value || '' }}
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='email'
        :header="t('hrm.candidate.general.email')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='phoneNumber'
        :header="t('hrm.candidate.general.phoneNumber')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='px-2 text-center'
        :header='t(`book-ticket.ticketAgent.contactList.action`)'
        :row-editor='true'
        style='width: 5%;'>
        <template #body='{ data, index }'>
          <div class='flex gap-2 justify-content-center'>
            <template v-if='editingRows.some(r => r.id === data.id)'>
              <AppIcon
                class='cursor-pointer hover-btn'
                name='check'
                size='1.6'
                @click='saveRowEdit(data, index)'/>
              <AppIcon
                class='cursor-pointer hover-btn'
                name='close'
                size='1.6'
                @click='cancelRowEdit(data)'/>
            </template>
            <template v-else>
              <AppIcon
                class='cursor-pointer hover-btn'
                name='edit'
                size='1.5'
                @click='startEditingRow(index)'/>
              <AppIcon
                class='cursor-pointer hover-btn text-red-500'
                name='delete'
                size='1.5'
                @click='deleteRow(data.id)'/>
            </template>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang='ts' setup>
import type { DataTableRowEditSaveEvent } from 'primevue/datatable';
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { ReferencePersons } from '@/apps/hrm/model/candidate';
const { t } = useI18n();    

const referencePersonValue = defineModel('referencePersons', {
  type: Array as PropType<ReferencePersons[]>,
  default: [], 
});

interface Position {
  id: string;
  value: string;
}
const positions = ref<Position[]>([]);
const editingRows = ref<ReferencePersons[]>([]);

const addRow = () => {
  const newRow: ReferencePersons = {
    id: String(Date.now() + Math.random()),
    companyName: '',
    email: '',
    fullName: '',
    jobPositionCode: '',
    phoneNumber: '',
    isNew: true,
    isCreater: true
  };
  referencePersonValue.value = [...referencePersonValue.value, newRow];
  editingRows.value = [newRow];
};

const onRowEditSave = (event:DataTableRowEditSaveEvent) => {
  let { newData, index } = event;
  const newArr = [...referencePersonValue.value];
  newArr[index] = { ...newData };
  referencePersonValue.value = newArr;
};

const startEditingRow = (index: number) => {
  const rowData = referencePersonValue.value[index];
  if (!editingRows.value.includes(rowData)) {
    editingRows.value = [...editingRows.value, rowData];
  }
};
const deleteRow = (id?: string) => {
  referencePersonValue.value = referencePersonValue.value.filter(item => item.id !== id);
  editingRows.value = editingRows.value.filter(item => item.id !== id);
};

const saveRowEdit = (rowData: ReferencePersons, index: number) => {
  if (rowData.isNew) {
    delete rowData.isNew;
  }
  const newArr = [...referencePersonValue.value];
  newArr[index] = { ...rowData };
  referencePersonValue.value = newArr;
  editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
};

const cancelRowEdit = (rowData: ReferencePersons) => {
  if (rowData.isNew) {
    deleteRow(rowData.id);
  } else {
    editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
  }
};
onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_POSITION, positions, {
    labelProp: 'name',
    idProp: 'code'
  });
});

</script>

<style scoped>
.hover-btn {
  transition:transform 0.2s;
  border-radius: 50%;
}

.hover-btn:hover {
  opacity: 0.7;  
  transform: scale(1.001);
}

:deep(.p-column-header-content) {
  display: inline-block;
}
</style>