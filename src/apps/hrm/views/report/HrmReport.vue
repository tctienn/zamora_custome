<template>
  <div
    class='h-full'>
    <div class='flex flex-column gap-2 mb-2'>
      <Toolbar class='h-3rem p-0'>
        <template #start>
          <div class='align-items-center flex font-semibold gap-2 ml-2'>
            Danh sách báo cáo
          </div>
        </template>
        <template #end>
          <ButtonGroup style='opacity: 0'>
            <Button
              class='focus:shadow-none'
              icon='pi pi-file-import'
              severity='secondary'
              style='border-radius: 0'></Button>
            <Button
              class='focus:shadow-none'
              icon='pi pi-file-export'
              severity='secondary'></Button>
            <Button
              class='focus:shadow-none'
              icon='pi pi-cog'
              severity='secondary'></Button>
          </ButtonGroup>
        </template>
      </Toolbar>
    </div>
    <div
      class='surface-0 w-full'>
      <TabView>
        <TabPanel header='Báo cáo theo mẫu'>
          <div
            class='overflow-auto'
            style='max-height: 52rem'>
            <table class='custom-table'>
              <thead>
                <tr style='background: #F3F3F3; color: black'>
                  <th>STT</th>
                  <th>Tên báo cáo</th>
                  <th>Ký hiệu</th>
                  <th>Lượt view</th>
                  <th>Lượt kết xuất</th>
                  <th>Người xem</th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for='parent in dataReport'
                  :key='parent.code'>
                  <tr
                    class='font-semibold parent-row row-data'
                    style='background: #CFE2F3; color: black'>
                    <td>{{ parent.order }}</td>
                    <td style='text-align: left'>{{ parent.reportName }}</td>
                    <td style='text-align: center'>{{ parent.code }}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr
                    v-for='child in parent.subReport'
                    :key='child.code'
                    :class="{ 'selected-row': selectedReportCode === child.code }">
                    <td>{{ child.order }}</td>
                    <td
                      style='text-align: left'
                      @click='showReport(child)'>{{
                        child.reportName
                      }}
                    </td>
                    <td style='text-align: center'>{{ child.code }}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel header='Báo cáo động'>

        </TabPanel>

        <!--        <TabPanel header='Báo nhân sự theo phòng ban'>-->
        <!--          <EmployeeByOrganization/>-->
        <!--        </TabPanel>-->
      </TabView>

    </div>
  </div>

  <component
    :is='isComponent'
    v-if='isComponent && visibleReport'
    :visible='visibleReport'
    @hide-dialog='hideFn'/>
</template>

<script setup lang='ts'>
import { type Component, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { dataReport, type SubReport } from '@/apps/hrm/model/report';

const { t } = useI18n();

const items = ref([
  { label: 'Báo cáo theo mẫu', },
  { label: 'Báo cáo động', },
  { label: 'Báo nhân sự theo phòng ban', },
]);
const hasPermission = usePermissionStore().hasPermission;

const visibleReport = ref(false);
const selectedReportCode = ref<string | null>(null);
const isComponent = ref<Component | null>(null);
const showReport = (report: SubReport) => {
  if (hasPermission('/HRM/HRM_TOOLS/HRM_REPORT/VIEW')) {
    selectedReportCode.value = report.code;
    isComponent.value = report.component || null;
    visibleReport.value = true;
  }
};
const hideFn = () => {
  visibleReport.value = false;
  // selectedReportCode.value = null;
};
</script>

<style scoped>
.custom-table {
  border-collapse: collapse;
  width: 100%;
  table-layout: auto;
  font-size: 13px;
}

td,
th {
  padding: 12px 8px;
  border: 1px solid #ccc;
  text-align: center;
  vertical-align: middle;
  word-break: break-word;
  white-space: normal;
  font-size: 13px;
}

.custom-table tr:hover {
  background-color: #e6f7ff;
  cursor: pointer;
  color: black
}

thead th {
  position: sticky;
  top: 0;
  background-color: #F3F3F3; /* Màu nền giống như hiện tại */
  z-index: 1;
}

:deep(.p-tabview-panels) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 12px !important;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  padding: 12px 10px !important;
}

.selected-row {
  background-color: #bae6fd !important;
  color: black
}
</style>