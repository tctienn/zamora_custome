<template>
  <div>
    <AssignWorkHeader
      :search-from-date='searchFromDate'
      :search-to-date='searchToDate'
      @update-range='updateRange'/>
  </div>

  <div>
    <div class='align-items-center flex justify-content-between w-full'>
      <div class='w-5'>
        <Chart
          class='w-full'
          :data='{
            labels: statusCount.map(i=>i.title),
            datasets: [
              {
                data: statusCount.map(i=>i.count),
                backgroundColor: [documentStyle.getPropertyValue("--blue-500"), documentStyle.getPropertyValue("--yellow-500"), documentStyle.getPropertyValue("--green-500")],
                hoverBackgroundColor: [documentStyle.getPropertyValue("--blue-400"), documentStyle.getPropertyValue("--yellow-400"), documentStyle.getPropertyValue("--green-400")]
              }
            ]
          }'
          :options='{cutout: "60%",
                     plugins: {
                       legend: {
                         position: "right"
                       }
                     } }'
          type='doughnut'/>
      </div>
      <div class='w-6'>
        <div class='flex justify-content-between'>
          <div
            v-for='status of statusCount'
            :key='status.title'
            class='align-items-center flex flex-column'>
            <h5>{{ status.title }}</h5>
            <p>{{ status.count }}</p>
            <p>{{ Math.round((status.count / totalCountStatus) * 100) }}% Công việc</p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <DataTable
        :value='tasks'
        v-bind='DEFAULT_DATATABLE_CONFIG'>

        <!--        <Column-->
        <!--        field=''-->
        <!--        header=''-->
        <!--        />-->

      </DataTable>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { groupBy, sumBy } from 'lodash';
import moment from 'moment';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findTasksByAssignerRangeDateGraphql } from '@/apps/work/api/graphql/asign-work-api';
import { Task } from '@/apps/work/model/task';
import AssignWorkHeader from '@/apps/work/views/manager/assign/AsignWorkHeader.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';

const { t } = useI18n();

const now = new Date();
const searchFromDate = ref(moment(now).add(-1, 'month').toDate());
const searchToDate = ref(moment(now).add(1, 'month').toDate());
const tasks = ref<Task[]>([]);
const statusCount = ref<{ title: string, count: number }[]>([]);
const totalCountStatus = ref();
const taskGroupByDepartment = ref();
const documentStyle = getComputedStyle(document.body);
const searchRangeDate = computed(() => ({
  fromDate: moment(searchFromDate.value).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
  toDate: moment(searchToDate.value).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
}));

const {
  refetch: findTasksByAssignerRangeDateRefetch,
  onResult: findTasksByAssignerRangeDateOnResult,
  onError: findTasksByAssignerRangeDateOnError
} = findTasksByAssignerRangeDateGraphql(searchRangeDate.value);
findTasksByAssignerRangeDateOnResult(res => {
  tasks.value = res.data.findTasksByAssignerRangeDate;
  const statusCountTemp: { [key: string]: number } = {};
  tasks.value.forEach(task => {
    const title = task.statusName;
    if (title) {
      if (statusCountTemp[title]) {
        statusCountTemp[title] += 1;
      } else {
        statusCountTemp[title] = 1;
      }
    }
  });

  statusCount.value = Object.entries(statusCountTemp).map(([title, count]) => ({
    title,
    count
  }));

  totalCountStatus.value = sumBy(statusCount.value, 'count');

  taskGroupByDepartment.value = groupBy(tasks.value, 'department');

});
findTasksByAssignerRangeDateOnError(error => {
  toastError({ message: error.message });
});

function updateRange({
  fromDate,
  toDate
}: {
  fromDate: Date,
  toDate: Date
}) {
  searchFromDate.value = fromDate;
  searchToDate.value = toDate;
}

function reload() {
  findTasksByAssignerRangeDateRefetch(searchRangeDate.value);
}

watch(() => searchRangeDate.value, () => {
  reload();
});

</script>

<script lang='ts'>
export default { name: 'AssignWorkStatistic' };
</script>