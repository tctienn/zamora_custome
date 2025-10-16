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
          {{ t('hrm.report.childrenOfficerReport') }}
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
          <!--          <Button-->
          <!--            icon='pi pi-print'-->
          <!--            label='In'/>-->
          <!--          <Button-->
          <!--            icon='pi pi-refresh'/>-->
        </div>
      </div>
    </template>
    <DataTable
      :row-class='rowClass'
      scroll-height='flex'
      scrollable
      :show-gridlines='true'
      :value='tableData'>
      <Column
        :colspan='9'
        header='STT'>
        <template #body='{data}'>
          {{ data?.orgName ? data?.orgName : data?.stt }}
        </template>
      </Column>
      <Column
        header='Mã nhân viên'>
        <template #body='{data}'>
          {{ data?.code ? data?.code : '' }}
        </template>
      </Column>
      <Column
        field='fullName'
        header='Họ và tên'/>
      <Column
        field='employeeName'
        header='Họ và tên con'/>
      <Column
        field='yearBirth'
        header='Năm sinh'/>
      <Column
        header='Tuổi'>
        <template #body='{data}'>
          {{ data?.yearBirth ? new Date().getFullYear() - data?.yearBirth : '' }}
        </template>
      </Column>
      <Column
        field='job'
        header='Nghề nghiệp'/>
      <Column
        field='workUnit'
        header='Đơn vị công tác'/>
      <Column
        body-class='w-1'
        field='relationship'
        header='Quan hệ'/>
    </DataTable>

  </Sidebar>
</template>

<script setup lang='ts'>
import { throttle } from 'lodash';
import Column from 'primevue/column';
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { childrenOfficerReport } from '@/apps/hrm/api/graphql/employee';
import AppIcon from '@/common/components/app/AppIcon.vue';

const emits = defineEmits(['hide-dialog']);
const { t } = useI18n();
const isLoading = ref(true);
const visible = defineModel('visible', { type: Boolean });

const data = ref<any>([]);
const tableData = ref<any>([]);

const { onResult: findEmployeeEducationReportResult } = childrenOfficerReport();

findEmployeeEducationReportResult((res) => {
  data.value = res.data.childrenOfficerReport;
  tableData.value = transformToTableData(data.value);
  isLoading.value = false;
});

// Tạo danh sách hiển thị theo định dạng cấp A → A1 → nhân viên
function transformToTableData(data: any[]): any[] {
  const result: any[] = [];
  const orgMap = new Map<string, any>();
  const childrenMap = new Map<string, any[]>();

  data.forEach(org => {
    orgMap.set(org.orgId, org);
    if (!org.parentCode) {
      return;
    }
    if (!childrenMap.has(org.parentCode)) {
      childrenMap.set(org.parentCode, []);
    }
    childrenMap.get(org.parentCode)!.push(org);
  });

  let stt = 1;
  let companyIndex = 1;

  for (const org of data) {
    if (org.parentCode) {
      continue;
    } // chỉ lấy cấp 1

    result.push({
      groupRow: 'level1',
      orgName: `${companyIndex}. ${org.orgName}`
    });
    companyIndex++;

    const departments = childrenMap.get(org.orgId) || [];
    let deptIndex = 1;

    for (const dept of departments) {
      result.push({
        groupRow: 'level2',
        orgName: `${toRoman(deptIndex)}. ${dept.orgName}`
      });
      deptIndex++;

      for (const emp of dept.employees) {
        result.push({
          ...emp,
          stt: stt++
        });
      }
    }
  }

  return result;
}

// Tô màu từng loại dòng
function rowClass(row: any) {
  if (row.groupRow === 'level1') {
    return 'row-level1';
  }
  if (row.groupRow === 'level2') {
    return 'row-level2';
  }
  return '';
}

const hideForm = () => {
  emits('hide-dialog');
};

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight) {
    // load more logic if needed
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

function toRoman(num: number): string {
  const roman = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  const value = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  let result = '';
  for (let i = 0; i < value.length; i++) {
    while (num >= value[i]) {
      result += roman[i];
      num -= value[i];
    }
  }
  return result;
}
</script>

<style scoped>
:deep(.row-level1 td) {
  background: #1976d2 !important;
  color: #232121;
  font-weight: bold;
}

:deep(.row-level2 td) {
  background: #e3f2fd !important;
  font-weight: 600;
  color: #232121;
}

.white-space-nowrap {
  white-space: nowrap;
}
</style>