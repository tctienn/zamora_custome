<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width:95vw'
    @hide="emits('hide-dialog')">
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2 p-sidebar-header-content'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          {{ t('hrm.report.professionalSkillsReport') }}
        </div>
        <div class='flex gap-2'>
          <SplitButton>
            <span class='align-items-center flex font-medium gap-2'>
              <AppIcon
                name='filter_alt'
                size='1.3'/>
              <span>Điều kiện lập</span>
            </span>
          </SplitButton>
          <Button
            icon='pi pi-file-export'
            label='Kết xuất'/>
          <Button
            icon='pi pi-print'
            label='In'/>
          <Button
            icon='pi pi-refresh'/>
        </div>
      </div>
    </template>
    <DataTable
      class='white-space-nowrap'
      group-rows-by='organizationId'
      :loading='isLoading'
      row-group-mode='rowspan'
      scroll-direction='both'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      sort-field='organizationId'
      sort-mode='single'
      :sort-order='1'
      table-style='min-width: 200rem'
      :value='data'>
      <ColumnGroup type='header'>
        <Row>
          <Column
            header='STT'
            :rowspan='2'/>
          <Column
            header='Mã nhân viên'
            :rowspan='2'/>
          <Column
            header='Họ và tên'
            :rowspan='2'/>
          <Column
            header='Phòng ban đơn vị trực thuộc'
            :rowspan='2'/>
          <Column
            header='Giới tính'
            :rowspan='2'/>
          <Column
            header='Ngày sinh'
            :rowspan='2'/>
          <Column
            header='Tuổi'
            :rowspan='2'/>
          <Column
            header='Dân tộc'
            :rowspan='2'/>
          <Column
            header='Kỹ năng chuyên môn'
            :rowspan='2'/>
          <Column
            header='Trình độ văn hóa'
            :rowspan='2'/>

          <Column
            header='Trình độ chuyên môn'
            :rowspan='2'/>

          <Column
            header='Chuyên ngành'
            :rowspan='2'/>

          <Column
            header='Công vệc chuyên môn'
            :rowspan='2'/>

          <Column
            header='Mô tả chi tiết công việc'
            :rowspan='2'/>

          <Column
            header='Ngày vào đơn vị'
            :rowspan='2'/>

          <Column
            header='Đảng viên'
            :rowspan='2'/>

          <Column
            header='Chức vụ'
            :rowspan='2'/>

          <Column
            header='Chức danh'
            :rowspan='2'/>

          <Column
            header='Nơi ở hiện nay'
            :rowspan='2'/>

          <Column
            header='Ghi chú'
            :rowspan='2'/>

        </Row>

      </ColumnGroup>

      <Column
        header-style='width:3rem'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column field='code'/>
      <Column field='fullName'/>
      <Column field='organizationName'/>
      <Column field='gender'>
        <template #body='{data: {gender}}'>
          {{ gender ? t('admin.employee.genderInfo.' + gender) : '' }}
        </template>
      </Column>
      <Column field='birthDay'>
        <template #body='{data: {birthDay}}'>
          {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='age'/>
      <Column field='nation'/>
      <Column field='listProfessionalSkills'>
        <template #body='{data: {listProfessionalSkills}}'>
          {{ listProfessionalSkills?.replaceAll('"', '').replaceAll('[', '').replaceAll(']', '') }}
        </template>
      </Column>
      <Column field='generalLevel'/>
      <Column>
        <template #body='{data: {professionalLevel}}'>
          {{ professionalLevel?.replace('"', '') }}
        </template>
      </Column>
      <Column/>
      <Column/>
      <Column/>
      <Column field='fromDate'>
        <template #body='{data: {fromDate}}'>
          {{ fromDate ? moment(fromDate).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column field='isParty'>
        <template #body='{data: {isParty}}'>
          {{ isParty ? 'Có' : 'Không' }}
        </template>
      </Column>
      <Column field='position'/>
      <Column field='jobTitle'/>
      <Column field='address'/>
      <Column/>
    </DataTable>

  </Sidebar>
</template>

<script setup lang='ts'>
import { get, throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { professionalSkillsReport } from '@/apps/hrm/api/graphql/contract';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';
import { getYearMonthDiff } from '@/common/helpers/time-util';
import type { Pageable } from '@/common/model/query';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isLoading = ref(true);
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const pageable = reactive<Pageable>({
  page: 0,
  size: 99999
});
const canLoadMore = ref(true);
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const isLoadMore = ref(true);
const { onResult: findEmployeeEducationReportResult } = professionalSkillsReport();

const { moment } = useMoment();
findEmployeeEducationReportResult((res) => {
  data.value = get(res, 'data.professionalSkillsReport', { edges: [] });

  isLoadMore.value = false;
  isLoading.value = false;
});

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scrollend', throttle(scrollEvent, 1000));
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});
</script>

<style scoped>
.white-space-nowrap {
  white-space: nowrap;
}
</style>