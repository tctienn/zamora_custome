<template>
  <DataTable
    :value='participant'>
    <Column :header="t('work.project.chart.fullName')">
      <template #body='{data}'>
        <AppUser
          info-visible
          :infos="['positionName', 'departments']"
          name-visible
          :user-id='data?.participantId'>
        </AppUser>
      </template>
    </Column>

    <Column
      body-class='text-center'
      :header="t('work.project.chart.taskQuantity')">
      <template #body='{data}'>
        {{ data?.taskCount }}
      </template>
    </Column>

    <Column :header="t('work.project.chart.workingStatus')">
      <template #body='{data}'>
        <div class='flex gap-2'>
          <div class='flex gap-1 w-full'>
            <div
              v-if='data?.taskStatusCount?.completed'
              v-tooltip.top='t("work.status.done")'
              :style="{
                width: (data?.taskStatusCount?.completed / data?.taskCount) * 100 + '%',
                transition: 'width 1s ease-in-out'
              }">
              <div class='text-center'>
                {{ data?.taskStatusCount?.completed }}
              </div>
              <div
                style='height: 10px; background: #94C748'>
                &nbsp;
              </div>
            </div>

            <div
              v-if='data?.taskStatusCount?.working'
              v-tooltip.top='t("work.status.processing")'
              class='flex flex-column'
              :style="{
                width: (data?.taskStatusCount?.working / data?.taskCount) * 100 + '%',
                transition: 'width 1s ease-in-out'
              }">
              <div class='text-center'>
                {{ data?.taskStatusCount?.working }}
              </div>
              <div
                class='bg-blue-400'
                style='height: 10px'>
                &nbsp;
              </div>
            </div>

            <div
              v-if='data?.taskStatusCount?.other'
              v-tooltip.top='t("work.project.other")'
              class='flex flex-column'
              :style="{
                width: (data?.taskStatusCount?.other / data?.taskCount) * 100 + '%',
                transition: 'width 1s ease-in-out'
              }">
              <div class='text-center'>
                {{ data?.taskStatusCount?.other }}
              </div>
              <div
                class='bg-orange-400'
                style='height: 10px'>
                &nbsp;
              </div>
            </div>
          </div>
          <ProgressRing
            :progress='round((data?.taskStatusCount?.completed||0)/(data?.taskCount || 1)*100,1)'></ProgressRing>
        </div>

      </template>
    </Column>
  </DataTable>
</template>

<script lang='ts' setup>
import { round } from 'lodash';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ParticipantStatistic } from '@/apps/work/views/project/component/detail/general-info/type';
import AppUser from '@/common/components/app/AppUser.vue';
import ProgressRing from '@/common/components/custom/ProgressRing.vue';

const props = defineProps({
  participant: {
    type: Array as PropType<ParticipantStatistic[]>,
    default: () => []
  }
});
const { t } = useI18n();
</script>

<style scoped>

</style>