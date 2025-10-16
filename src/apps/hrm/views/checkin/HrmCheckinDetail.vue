<template>
  <div class='grid-avatar'>
    <div
      v-for='c in checkins'
      :key='c.id'
      class='flex flex-column gap-2'>
      {{ moment(c.timeStamp).format('HH:mm:ss') }}
      <img
        v-if='c.detectedImageUrl'
        alt='detectedImg'
        class='w-6rem'
        :src='c.detectedImageUrl'/>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { employeeSummaryById } from '@/apps/hrm/api/graphql/employee';
import type { Checkin } from '@/apps/hrm/model/checkin';
import type { EmployeeSummary } from '@/apps/hrm/model/employee';
import { useCheckinSSE } from '@/apps/hrm/views/checkin/checkin-sse';
import { HRM_URL } from '@/common/api/configService';
import useMoment from '@/common/helpers/mixins/use-moment';

const route = useRoute();
const { moment } = useMoment();
const employeeId = route.params.employeeId as string;
const employee = ref<EmployeeSummary>();
employeeSummaryById(employeeId).onResult((res) => {
  employee.value = res.data?.employeeSummaryById;
});
const checkins = ref<Checkin[]>();

const sse = useCheckinSSE();

onMounted(() => {
  sse.register(`${HRM_URL}/sse/checkin/employee/${employeeId}`,
    {
      'all-employee-checkin': (e) => {
        checkins.value = JSON.parse(e['data']) as Checkin[] || [];
      },
      'update-employee-checkin': (e) => {
        const checkin = JSON.parse(e['data']) as Checkin;
        checkins.value = [
          ...(checkins.value || []).filter((item) => item.id !== checkin.id),
          checkin
        ];
      }
    });
});
</script>

<style scoped>
.grid-avatar {
  display: grid;
  gap: 1rem;
}

@media (min-width: 26rem) {
  .grid-avatar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 35rem) {
  .grid-avatar {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 53rem) {
  .grid-avatar {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 71rem) {
  .grid-avatar {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (min-width: 89rem) {
  .grid-avatar {
    grid-template-columns: repeat(10, 1fr);
  }
}

@media (min-width: 107rem) {
  .grid-avatar {
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (min-width: 143rem) {
  .grid-avatar {
    grid-template-columns: repeat(16, 1fr);
  }
}
</style>