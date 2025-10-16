<template>

  <div class='align-items-center flex justify-content-between mb-2'>  
    <p class='font-bold'>{{ t('hrm.candidate.education.title')}}</p> 
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
      :value='educationValue'
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
        field='fromYear'
        :header="t('hrm.candidate.education.fromYear')">
        <template #editor='{ data, field }'>
          <NamedInputCalendar
            v-model='data[field]'
            class='w-full'
            date-format='yy' 
            input-format='YYYY'
            view='year'/>
        </template>
        <template #body='{ data }'>
          {{ formatDate(data.fromYear, 'YYYY') }}
        </template>
      </Column>
      <Column
        class='col-1'
        field='toYear'
        :header="t('hrm.candidate.education.toYear')">
        <template #editor='{ data, field }'>
          <NamedInputCalendar
            v-model='data[field]'
            class='w-full' 
            date-format='yy'
            input-format='YYYY'
            view='year'/>
        </template>
        <template #body='{ data }'>
          {{ formatDate(data.toYear, 'YYYY') }}
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='schoolName'
        :header="t('hrm.candidate.education.schoolName')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-1'
        field='majorCode'
        :header="t('hrm.candidate.education.majorCode')">
        <template #editor='{ data, field }'>
          <Dropdown
            v-model='data[field]'
            class='w-full'
            option-label='value'
            option-value='id'
            :options='majors'
            placeholder='Chọn chuyên ngành'/>
        </template>
        <template #body='{ data }'>
          {{ majors.find(opt => opt.id == data.majorCode)?.value || '' }}
        </template>
      </Column>
      <Column
        class='col-1'
        field='graduationClassification'
        :header="t('hrm.candidate.education.graduationClassification')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
        </template>
      </Column>
      <Column
        class='col-1 px-2'
        field='relatedSubjects'
        :header="t('hrm.candidate.education.relatedSubjects')">
        <template #editor='{ data, field }'>
          <InputText
            v-model='data[field]'
            class='w-full' />
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
            v-sanitize-html="data.outstandingAchievements || 'Nhập...'"
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
        header='Nhập thành tích nổi bật' 
        modal 
        :style="{ width: '50vw' }">
        <AppEditor
          v-model='editingRow.outstandingAchievements'
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
import { onMounted, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CATEGORY_TYPE } from '@/apps/hrm/constants/category';
import { fetchCategoryMappingNameWithId } from '@/apps/hrm/helpers/utils';
import type { CandidateEducations } from '@/apps/hrm/model/candidate';
import AppEditor from '@/common/components/custom/AppEditor.vue';
import NamedInputCalendar from '@/common/components/custom/NamedInputCalendar.vue';
import { formatDate } from '@/common/helpers/utils';
const { t } = useI18n();    

const educationValue = defineModel('educations', {
  type: Array as PropType<CandidateEducations[]>,
  default: [], 
});

interface Major {
  id: string;
  value: string;
}
const majors = ref<Major[]>([]);
const editingRows = ref<CandidateEducations[]>([]);
const editorVisible = ref(false);
const editingRow = ref<CandidateEducations>({} as CandidateEducations);
const addRow = () => {
  const newRow = {
    id: String(Date.now() + Math.random()),
    fromYear: new Date(),
    toYear: new Date(),
    schoolName: '',
    majorCode: '',
    graduationClassification: '',
    relatedSubjects: '',
    outstandingAchievements: '',
    isNew: true,
    isCreater: true
  };
  educationValue.value = [...educationValue.value, newRow];
  editingRows.value = [newRow];
};

const onRowEditSave = (event:DataTableRowEditSaveEvent) => {
  let { newData, index } = event;
  console.log(newData);
  educationValue.value[index] = newData;
};

const startEditingRow = (index: number) => {
  const rowData = educationValue.value[index];
  if (!editingRows.value.includes(rowData)) {
    editingRows.value = [...editingRows.value, rowData];
  }
};
const deleteRow = (id?: string) => {
  educationValue.value = educationValue.value.filter(item => item.id !== id);
  editingRows.value = editingRows.value.filter(item => item.id !== id);
};

const saveRowEdit = (rowData: CandidateEducations, index: number) => {
  if (rowData.isNew) {
    delete rowData.isNew;
  }
  educationValue.value[index] = rowData;
  editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
};

const cancelRowEdit = (rowData: CandidateEducations) => {
  if (rowData.isNew) {
    deleteRow(rowData.id);
  } else {
    editingRows.value = editingRows.value.filter(r => r.id !== rowData.id);
  }
};

function openEditor(row: CandidateEducations) {
  editingRow.value = row;
  editorVisible.value = true;
}

function saveEditor() {
  editorVisible.value = false;
}
onMounted(() => {
  fetchCategoryMappingNameWithId(CATEGORY_TYPE.MAJOR, majors, {
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