<template>
  <div class='align-items-center flex justify-content-between mb-2'>  
    <p class='font-bold'>{{ t('hrm.candidate.workExperience.title')}}</p> 
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
      :value='experienceValue'
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
            view='month'/>
        </template>
        <template #body='{ data }'>
          {{ formatDate(data.toMonthYear, 'MM/YYYY') }}
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
        field='jobTitleCode'
        :header="t('hrm.candidate.workExperience.jobTitleCode')">
        <template #editor='{ data, field }'>
          <Dropdown
            v-model='data[field]'
            class='w-full'
            option-label='value'
            option-value='id'
            :options='jobTitles'
            placeholder='Chọn chức danh'/>
        </template>
        <template #body='{ data }'>
          {{ jobTitles.find(job => job.id == data.jobTitleCode)?.value || '' }}
        </template>
      </Column>
      <Column
        class='col-1'
        field='jobDescription'
        :header="t('hrm.candidate.workExperience.jobDescription')">
        <template #body='{ data }'>
          <div 
            class=''>
            <span v-sanitize-html="data.jobDescription || ''"></span>
          </div>
        </template>

        <template #editor='{ data }'>
          <div 
            v-sanitize-html="data.jobDescription || 'Nhập mô tả...'"
            class='cell-input-like p-inputtext'
            @click='openEditor(data, "jobDescription")'>
          </div>
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='outstandingAchievements'
        :header="t('hrm.candidate.education.outstandingAchievements')">
        <template #body='{ data }'>
          <div 
            class=''>
            <span v-sanitize-html="data.outstandingAchievements || ''"></span>
          </div>
        </template>

        <template #editor='{ data }'>
          <div 
            v-sanitize-html="data.outstandingAchievements || 'Nhập thành tích...'"
            class='cell-input-like p-inputtext'
            @click='openEditor(data, "outstandingAchievements")'>
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
        :header='dialogTitle'
        modal 
        :style="{ width: '50vw' }">
        <AppEditor
          v-model='editingRow[editingField]'
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
import { computed, onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { WorkExperiences } from '@/apps/hrm/model/candidate';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import { formatDate } from '@/common/helpers/utils';
const { t } = useI18n();    

const experienceValue = defineModel('experiences', {
  type: Array as PropType<WorkExperiences[]>,
  default: [], 
});

interface JobTitles {
  id: string;
  value: string;
}
const jobTitles = ref<JobTitles[]>([]);
const editingRows = ref<WorkExperiences[]>([]);
const editorVisible = ref(false);
const editingRow = ref<WorkExperiences>({} as WorkExperiences);
const editingField = ref<'jobDescription' | 'outstandingAchievements'>('jobDescription');
const dialogTitle = computed(() => 
  editingField.value === 'jobDescription'
    ? 'Nhập mô tả công việc'
    : 'Nhập thành tích nổi bật'
);
const addRow = () => {
  const newRow: WorkExperiences = {
    id: String(Date.now() + Math.random()),
    fromMonthYear: new Date(),
    toMonthYear: new Date(),
    companyName: '',
    jobTitleCode: '',
    jobDescription: '',
    outstandingAchievements: '',
    isNew: true,
    isCreater: true
  };
  experienceValue.value = [...experienceValue.value, newRow];
  editingRows.value = [newRow];
};

const onRowEditSave = (event:DataTableRowEditSaveEvent) => {
  let { newData, index } = event;
  console.log(newData);
  experienceValue.value[index] = newData;
};

const startEditingRow = (index: number) => {
  const rowData = experienceValue.value[index];
  if (!editingRows.value.includes(rowData)) {
    editingRows.value = [...editingRows.value, rowData];
  }
};
const deleteRow = (id?: string) => {
  experienceValue.value = experienceValue.value.filter(item => item.id !== id);
  editingRows.value = editingRows.value.filter(item => item.id !== id);
};

const saveRowEdit = (rowData: WorkExperiences, index: number) => {
  if (rowData.isNew) {
    delete rowData.isNew;
  }
  experienceValue.value[index] = rowData;
  editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
};

const cancelRowEdit = (rowData: WorkExperiences) => {
  if (rowData.isNew) {
    deleteRow(rowData.id);
  } else {
    editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
  }
};
onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.JOB_TITLE, jobTitles, {
    labelProp: 'name',
    idProp: 'code'
  });
});

function openEditor(row: WorkExperiences, field: 'jobDescription' | 'outstandingAchievements') {
  editingRow.value = row;
  editingField.value = field;
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
</style>