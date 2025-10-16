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
          {{ t('hrm.report.laborUtilizationReport') }}
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
      :loading='isLoading'
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
            :rowspan='3'/>
          <Column

            header='Họ và tên'
            :rowspan='3'/>
          <Column

            header='Mã số BHXH'
            :rowspan='3'/>
          <Column

            header='Ngày sinh'
            :rowspan='3'/>
          <Column
            header='Giới tính'
            :rowspan='3'/>
          <Column
            header='Số CCCD/CMT/Hộ chiếu'
            :rowspan='3'/>
          <Column
            header='Chức vụ, chức danh nghề, nơi làm việc'
            :rowspan='3'/>

          <Column
            :colspan='4'
            header='Vị trí làm việc'/>

          <Column
            :colspan='6'
            header='Tiền lương'/>

          <Column
            :colspan='2'
            header='Ngành nghề nặng nhọc, độc hại'
            :rowspan='2'/>

          <Column
            :colspan='5'
            header='Loại và hiệu lực hợp đồng lao động'
            :rowspan='1'/>

          <Column
            header='Thời điểm đơn vị bắt đầu đóng BHXH'
            :rowspan='3'/>
          <Column
            header='Thời điểm đơn vị kt thúc BHXH'
            :rowspan='3'/>
        </Row>

        <Row>
          <Column
            header='Nhà quản lý'
            :rowspan='2'/>
          <Column
            header='Chuyên môn kỹ thuật bậc cao'
            :rowspan='2'/>
          <Column
            header='Chuyên môn kỹ thuật bậc trung'
            :rowspan='2'/>
          <Column
            header='Khác'
            :rowspan='2'/>
          <Column
            header='Hệ số/mức lương'
            :rowspan='2'/>
          <Column
            :colspan='5'
            header='Phụ cấp'/>

          <Column
            header='Ngày bắt đầu HĐLĐ không xác định thời hạn'
            :rowspan='2'/>
          <Column
            :colspan='2'
            header='Hiệu lực hợp đồng xác định thời hạn'/>
          <Column
            :colspan='2'
            header='Hiệu lực hợp đồng khác (dưới 1 tháng, thử vệc)'/>

        </Row>

        <Row>
          <Column header='Chức vụ'/>
          <Column header='Thâm niên VK (%)'/>
          <Column header='Thâm niên nghề (%)'/>
          <Column header='Phụ cấp lương'/>
          <Column header='Các khoản bổ sung'/>

          <Column header='Ngày bắt đầu'/>
          <Column header='Ngày kết thúc'/>

          <Column header='Ngày bắt đầu'/>
          <Column header='Ngày kết thúc'/>

          <Column header='Ngày bắt đầu'/>
          <Column header='Ngày kết thúc'/>

        </Row>
      </ColumnGroup>

      <Column
        header-style='width:3rem'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        field='fullName'/>
      <Column
        field='codeBHXH'/>
      <Column
        field='birthDay'>
        <template #body='{data: {birthDay}}'>
          {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
        </template>
      </Column>
      <Column
        field='gender'>
        <template #body='{data:{gender}}'>
          {{ t('hrm.profile.general.genderOptions.' + lowerCase(gender.toString())) }}
        </template>
      </Column>
      <Column
        field='cccdNumber'/>
      <Column
        field='currentPosition'/>
      <Column/>
      <Column field='highestLevel'/>
      <Column/>
      <Column/>
      <Column/>
      <Column field='contractSalary.jobTitle'/>
      <Column/>
      <Column/>
      <Column>
        <template #body='{data: {contractSalaryBonus}}'>
          <pre>
{{ contractSalaryBonus?.map((b: any) => `${b.type}: ${b.amount}`).join('\n') }}
          </pre>
        </template>
      </Column>
      <Column/>
      <Column>
      </Column>
      <Column>
      </Column>
      <Column>
      </Column>
      <Column/>
      <Column/>
      <Column/>
      <Column/>
      <Column field='socialInsuranceParticipation'>
        <template #body='{data: {socialInsuranceParticipation}}'>
          {{ socialInsuranceParticipation ? moment(socialInsuranceParticipation).format('DD-MM-YYYY') : '' }}
        </template>
      </Column>
      <Column/>
    </DataTable>

  </Sidebar>
</template>

<script setup lang='ts'>
import { lowerCase, throttle } from 'lodash';
import Column from 'primevue/column';
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { laborUtilizationReport } from '@/apps/hrm/api/graphql/employee';
import AppIcon from '@/common/components/app/AppIcon.vue';
import useMoment from '@/common/helpers/mixins/use-moment';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isLoading = ref(true);
const visible = defineModel('visible', { type: Boolean });
const hideForm = () => {
  emits('hide-dialog');
};
const data = ref<any>([]);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const { onResult: findEmployeeEducationReportResult } = laborUtilizationReport();

const { moment } = useMoment();
findEmployeeEducationReportResult((res) => {
  data.value = res.data.laborUtilizationReport;
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