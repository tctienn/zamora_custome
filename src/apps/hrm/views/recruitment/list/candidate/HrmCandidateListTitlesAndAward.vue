<template>
  <div class='align-items-center flex justify-content-between mb-2'>  
    <p class='font-bold'>{{ t('hrm.candidate.titlesAndAwards.title')}}</p> 
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
      :value='titlesAndAwardValue'
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
        class='col-2'
        field='receivedIn'
        :header="t('hrm.candidate.certificates.receivedIn')">
        <template #editor='{ data, field }'>
          <NamedInputCalendar
            v-model='data[field]'
            class='w-full'
            date-format='yy' 
            input-format='YYYY'
            view='year'/>
        </template>
        <template #body='{ data }'>
          {{ formatDate(data.receivedIn, 'YYYY') }}
        </template>
      </Column>
      <Column
        class='col-5'
        field='titleAndAwardName'
        :header="t('hrm.candidate.titlesAndAwards.titleAndAwardName')">
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
        style='width: 6%;'>
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
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TitlesAndAwards } from '@/apps/hrm/model/candidate';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import { formatDate } from '@/common/helpers/utils';
const { t } = useI18n();    

const titlesAndAwardValue = defineModel('titlesAndAwards', {
  type: Array as PropType<TitlesAndAwards[]>,
  default: [], 
});

const editingRows = ref<TitlesAndAwards[]>([]);

const addRow = () => {
  const newRow: TitlesAndAwards = {
    id: String(Date.now() + Math.random()),
    receivedIn: new Date(),
    titleAndAwardName: '',
    isNew: true,
    isCreater: true
  };
  titlesAndAwardValue.value = [...titlesAndAwardValue.value, newRow];
  editingRows.value = [newRow];
};

const onRowEditSave = (event:DataTableRowEditSaveEvent) => {
  let { newData, index } = event;
  console.log(newData);
  titlesAndAwardValue.value[index] = newData;
};

const startEditingRow = (index: number) => {
  const rowData = titlesAndAwardValue.value[index];
  if (!editingRows.value.includes(rowData)) {
    editingRows.value = [...editingRows.value, rowData];
  }
};
const deleteRow = (id?: string) => {
  titlesAndAwardValue.value = titlesAndAwardValue.value.filter(item => item.id !== id);
  editingRows.value = editingRows.value.filter(item => item.id !== id);
};

const saveRowEdit = (rowData: TitlesAndAwards, index: number) => {
  if (rowData.isNew) {
    delete rowData.isNew;
  }
  titlesAndAwardValue.value[index] = rowData;
  editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
};

const cancelRowEdit = (rowData: TitlesAndAwards) => {
  if (rowData.isNew) {
    deleteRow(rowData.id);
  } else {
    editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
  }
};
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