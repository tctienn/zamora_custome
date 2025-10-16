<template>
  <div class='align-items-center flex justify-content-between mb-2'>  
    <p class='font-bold'>{{ t('hrm.candidate.extracurricularActivity.title')}}</p> 
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
      :value='extracurricularActivityValue'
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
        class='col-1'
        field='fromMonthYear'
        :header="t('hrm.candidate.workExperience.fromMonthYear')">
        <template #editor='{ data, field }'>
          <NamedInputCalendar
            v-model='data[field]'
            class='w-full'
            date-format='mm/yy'
            input-format='MM/YYYY'
            view='month'/>
        </template>
        <template #body='{ data }'>
          {{ formatDate(data.fromMonthYear, 'MM/YYYY') }}
        </template>
      </Column>
      <Column
        class='col-1'
        field='toMonthYear'
        :header="t('hrm.candidate.workExperience.toMonthYear')">
        <template #editor='{ data, field }'>
          <NamedInputCalendar
            v-model='data[field]'
            class='w-full' 
            date-format='mm/yy'
            input-format='MM/YYYY'
            name='dateOfIssue'
            view='month'/>
        </template>
        <template #body='{ data }'>
          {{ formatDate(data.toMonthYear, 'MM/YYYY') }}
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='organizationName'
        :header="t('hrm.candidate.extracurricularActivity.organizationName')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-1'
        field='positionName'
        :header="t('hrm.candidate.extracurricularActivity.positionName')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-2 px-2'
        field='description'
        :header="t('hrm.candidate.extracurricularActivity.description')">
        <!-- Hiển thị preview ngắn -->
        <template #body='{ data }'>
          <div 
            class=''>
            <span v-sanitize-html="data.description || ''"></span>
          </div>
        </template>

        <template #editor='{ data }'>
          <div 
            v-sanitize-html="data.description || 'Nhấn để nhập...'"
            class='cell-input-like p-inputtext'
            @click='openEditor(data)'>
          </div>
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
      <Dialog 
        v-model:visible='editorVisible' 
        header='Nhập mô tả' 
        modal 
        :style="{ width: '50vw' }">
        <AppEditor
          v-model='editingRow.description'
          class='h-64 w-full'
          editor-style='height: 10rem;' />

        <template #footer>
          <Button
            icon='pi pi-times'
            label='Đóng'
            text
            @click='editorVisible = false' />
          <Button
            icon='pi pi-check'
            label='Lưu'
            @click='saveEditor' />
        </template>
      </Dialog>
    </DataTable>
  </div>
</template>

<script lang='ts' setup>
import type { DataTableRowEditSaveEvent } from 'primevue/datatable';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ExtracuurricularActivities } from '@/apps/hrm/model/candidate';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import { formatDate } from '@/common/helpers/utils';
const { t } = useI18n();    

const extracurricularActivityValue = defineModel('extracurricularActivitys', {
  type: Array as PropType<ExtracuurricularActivities[]>,
  default: [], 
});

const editingRows = ref<ExtracuurricularActivities[]>([]);
const editorVisible = ref(false);
const editingRow = ref<ExtracuurricularActivities>({} as ExtracuurricularActivities);
const addRow = () => {
  const newRow: ExtracuurricularActivities = {
    id: String(Date.now() + Math.random()),
    fromMonthYear: new Date(),
    toMonthYear: new Date(),
    organizationName: '',
    positionName: '',
    description: '',
    isNew: true,
    isCreater: true
  };
  extracurricularActivityValue.value = [...extracurricularActivityValue.value, newRow];
  editingRows.value = [newRow];
};

const onRowEditSave = (event:DataTableRowEditSaveEvent) => {
  let { newData, index } = event;
  console.log(newData);
  extracurricularActivityValue.value[index] = newData;
};

const startEditingRow = (index: number) => {
  const rowData = extracurricularActivityValue.value[index];
  if (!editingRows.value.includes(rowData)) {
    editingRows.value = [...editingRows.value, rowData];
  }
};
const deleteRow = (id?: string) => {
  extracurricularActivityValue.value = extracurricularActivityValue.value.filter(item => item.id !== id);
  editingRows.value = editingRows.value.filter(item => item.id !== id);
};

const saveRowEdit = (rowData: ExtracuurricularActivities, index: number) => {
  if (rowData.isNew) {
    delete rowData.isNew;
  }
  extracurricularActivityValue.value[index] = rowData;
  editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
};

const cancelRowEdit = (rowData: ExtracuurricularActivities) => {
  if (rowData.isNew) {
    deleteRow(rowData.id);
  } else {
    editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
  }
};

function openEditor(row: ExtracuurricularActivities) {
  editingRow.value = row;
  editorVisible.value = true;
}

function saveEditor() {
  editorVisible.value = false;
}
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

.cell-input-like {
  cursor: pointer;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem; 
  padding: 0.75rem 0.75rem; 
}

.cell-input-like:hover {
  border-color: #213C7A;
}
</style>