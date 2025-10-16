<template>
  <div>
    <div
      v-for='(logs,idx) in detailsComputed'
      :key='idx'
      class='flex flex-column mb-2'>
      <AppUser
        avatar-size='2.5'
        :name-visible='true'
        :user-id='logs.createdBy'>
      </AppUser>
      <div
        v-for='detail in logs.logs'
        :key='detail.id'
        class='border-round flex flex-column gap-2 hover:surface-hover'>
        <LogRowDetail
          class='pl-6 py-2'
          :detail='detail'>
        </LogRowDetail>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';

import type { ILog } from '@/apps/work/model/projectLog';
import LogRowDetail from '@/apps/work/views/project/component/detail/log/LogRowDetail.vue';
import AppUser from '@/common/components/app/AppUser.vue';

const props = defineProps({
  details: {
    type: Array as PropType<ILog[]>,
    required: true
  }
});

const detailsComputed = computed<{ createdBy: string, logs: ILog[] }[]>(() => {
  if (props.details?.length <= 0) {
    return [];
  }
  const sorted = [...props.details]
    .sort((a, b) => {
      const timeA = new Date(a.createdTime).getTime();
      const timeB = new Date(b.createdTime).getTime();
      return timeB - timeA;
    });
  const rs: { createdBy: string, logs: ILog[] }[] = [{
    createdBy: sorted[0].createdBy,
    logs: []
  }];

  sorted.forEach((value, index) => {
    if (value.createdBy !== rs[rs.length - 1]['createdBy'] && index != 0) {
      rs.push({
        createdBy: value.createdBy,
        logs: [value]
      });
    } else {
      rs[rs.length - 1]['logs'].push(value);
    }
  });
  return rs;
});
</script>

<style scoped>

</style>