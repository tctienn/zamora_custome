<template>
  <Sidebar
    v-model:visible='visible'
    header='Thống kê kho số hóa'
    position='right'
    :show-close-icon='false'
    style='width: 50dvw'>
    <template #header>
      <div class='align-items-center border-300 border-bottom-1 flex justify-content-between pb-3 w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>

            <p class='font-semibold text-lg'>{{ t('hrm.digitizedFile.sidebar.title') }}</p>
          </div>
        </div>
      </div>

    </template>
    <div class='flex flex-column gap-3'>
      <p class='font-semibold text-lg'>1.{{ t('hrm.digitizedFile.sidebar.folderChecking') }}</p>
      <div>
        <div class='chart-container'>
          <Chart
            :data='chartData'
            :height='400'
            :options='chartOptions'
            type='doughnut'
            :width='400'/>
        </div>
        <div class='summary'>
          <p class='mb-0 text-normal'>
            Tổng dung lượng: <span class='font-semibold'>{{ readableSize }}</span>
          </p>
        </div>
      </div>
      <p class='font-semibold mb-0 text-lg'>2.{{ t('hrm.digitizedFile.sidebar.userChecking') }}</p>
      <div>
        <DataTable
          table-style='min-width: 50rem'
          :value='employeeAccessData'>
          <Column
            field='userId'
            :header="t('hrm.digitizedFile.table.userCol')"
            header-class='text-left justify-content-start'>
            <template #body='{data: {userId}}'>
              <div class='align-items-center flex gap-2'>
                <AppAvatar
                  :avatar='generateAvatarUrl(getEmployeeDataByUserId(userId).avt)'
                  :label='getEmployeeDataByUserId(userId).userFullName'
                  shape='circle'
                  size='3'/>
                <div>
                  <p class='font-medium mb-0'>{{ getEmployeeDataByUserId(userId).userFullName }}</p>
                  <span class='text-sm'>{{ getEmployeeDataByUserId(userId).positionName }} | {{ getEmployeeDataByUserId(userId).departmentName }}</span>
                </div>
              </div>
            </template>
          </Column>
          <Column
            class='text-center'
            field='viewed'
            header='Lượt xem'></Column>
          <Column
            class='text-center'
            field='downloaded'
            header='Lượt tải'></Column>
          <Column
            class='text-center'
            field='recentTimes'
            header='Lần gần nhất'>
            <template #body='{data: {recentTimes}}'>
              {{formatDateTime(recentTimes)}}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

  </Sidebar>
</template>

<script lang='ts' setup>
import type { ChartData, ChartOptions } from 'chart.js';
import { storeToRefs } from 'pinia';
import Chart from 'primevue/chart';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getChartDigitizedFileData, getHistoryUserLogFile } from '@/apps/hrm/api/graphql/digitized-files';
import type { FileAccessSummary, FileAccessSummaryByEmployee } from '@/apps/hrm/model/fileDigitized';
import { convertFileSize, generateAvatarUrl } from '@/common/helpers/file-utils';
import { formatDateTime } from '@/common/helpers/time-util';

const employeeAccessData = ref<FileAccessSummaryByEmployee[]>([]);
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const visible = defineModel('visible', {
  type: Boolean,
  default: false
});
const { t } = useI18n();
const chartOptions = ref<ChartOptions>({});
const chartData = ref<ChartData<'doughnut'> | undefined>();
const readableSize = ref<string>('0');
const { onResult: digitizedFileFolderData, } = getChartDigitizedFileData();
const { onResult: getUserHistoryLog, refetch: getUserHistoryLogRefetch } = getHistoryUserLogFile();

digitizedFileFolderData((res) => {
  const data = res.data?.getChartDigitizedFile;
  readableSize.value = convertFileSize(data.size);
  chartData.value = setChartData(data);
});

getUserHistoryLog((res) => {
  employeeAccessData.value = res.data?.getHistory;
});

const getEmployeeDataByUserId = (userId: string) => {
  const userInfo = allUsers.value.find(user => user.id === userId);
  return {
    userId: userInfo?.id,
    userFullName: userInfo?.fullName || 'unknown',
    departmentName: userInfo?.departments[0]?.name || 'unknown',
    positionName: userInfo?.positionName || 'unknown',
    avt: userInfo?.avatar || 'unknown'
  };
};

const setChartData = (data: FileAccessSummary) => {
  const documentStyle = getComputedStyle(document.body);
  const pdfCount = data.totalPdf ? data.totalPdf : 0;
  const wordCount = data.totalWord ? data.totalWord : 0;
  const excelCount = data.totalExcel ? data.totalExcel : 0;
  const imageCount = data.totalImage ? data.totalImage : 0;
  const otherCount = data.totalOther ? data.totalOther : 0;
  return {
    labels: [`PDF (${pdfCount})`, `Word (${wordCount})`, `Excel (${excelCount})`, `Image (${imageCount})`, `Khác (${otherCount})`],
    datasets: [
      {
        data: [pdfCount, wordCount, excelCount, imageCount, otherCount], // giá trị tương ứng MB
        backgroundColor: [
          documentStyle.getPropertyValue('--orange-400'),
          documentStyle.getPropertyValue('--blue-400'),
          documentStyle.getPropertyValue('--purple-400'),
          documentStyle.getPropertyValue('--red-400'),
          documentStyle.getPropertyValue('--primary-400'),

        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue('--orange-300'),
          documentStyle.getPropertyValue('--blue-300'),
          documentStyle.getPropertyValue('--purple-300'),
          documentStyle.getPropertyValue('--red-300'),
          documentStyle.getPropertyValue('--primary-300'),
        ],
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  let data = {} as ChartOptions;
  data = {
    plugins: {
      legend: {
        position: 'left', // 👈 đặt legend bên phải
        labels: { color: textColor }
      }
    }
  };
  return data;
};

watch(() => visible.value, (val) => {
  if(val) {
    getUserHistoryLogRefetch();
  }
});

function hideForm() {
  visible.value = false;
}

onMounted(() => {
  chartOptions.value = setChartOptions();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 1rem 0;
}

.summary {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
}

.summary strong {
  font-weight: 700;
}

:deep(.p-card-title) {
  font-size: 18px;
  font-weight: bold;
  color: #1A4F9C;
  text-align: center;
}

.p-card {
  border-radius: 0;
  width: 100%;
  max-width: 600px;
  margin: auto;
}

:deep(.p-card-content) {
  padding: 0
}

:deep(.chart-container) {
  padding: 0
}
:deep(.text-left .p-column-header-content) {
  justify-content: flex-start !important;
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 5px 7px;
}
</style>