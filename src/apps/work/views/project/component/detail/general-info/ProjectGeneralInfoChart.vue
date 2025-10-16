<template>
  <TabView
    v-model:active-index='activeIndex'
    class='static'
    lazy
    :pt="{
      navContainer:{
        class:['static',]
      },
      panelContainer:{
        class:['p-0']
      }
    }">
    <TabPanel :header="t('Tổng hợp thực hiện')">
      <SummaryChart
        :participant='projectStatistic.participant'/>
    </TabPanel>
    <TabPanel :header="t('Kết quả công việc')">
      <ResultChart
        :participant='projectStatistic.participant'/>
    </TabPanel>
    <TabPanel :header="t('Biểu đồ')">
      <DonutChart
        :summary-task-project='summaryTaskProject'/>
    </TabPanel>
  </TabView>

  <!--  <div class='flex flex-column h-full w-6'>-->
  <!--    <div class='align-content-center flex h-3rem justify-content-between summary-bar'>-->
  <!--      <div class='align-content-center flex flex-row gap-1 justify-content-between text-lg text-white'>-->
  <!--        <div class='align-items-center flex flex-row gap-1'>-->
  <!--          <AppIcon-->
  <!--            name='reorder'-->
  <!--            size='1.5'>-->
  <!--          </AppIcon>-->
  <!--          {{ t('work.project.summary') }}-->
  <!--        </div>-->
  <!--      </div>-->
  <!--      <ButtonIcon-->
  <!--        v-tooltip.top='t("common.action")'-->
  <!--        icon='more_vert'-->
  <!--        icon-size='1.5'-->
  <!--        rounded-->
  <!--        text-->
  <!--        @click='changeChartOption'/>-->
  <!--    </div>-->

  <!--    <TieredMenu-->
  <!--      ref='overlayChart'-->
  <!--      :model='chartOptions'-->
  <!--      popup>-->
  <!--      <template #item='{item:item}'>-->
  <!--        <div-->
  <!--          class='align-content-center cursor-pointer flex gap-2 p-2'-->
  <!--          @click='item.command'>-->
  <!--          <AppIcon-->
  <!--            class='w-2'-->
  <!--            name='check'-->
  <!--            :size='item.active?"1.5":"0"'>-->
  <!--          </AppIcon>-->
  <!--          <span class='ml-2 w-7'>{{ item.label }}</span>-->
  <!--        </div>-->
  <!--      </template>-->
  <!--    </TieredMenu>-->
  <!--  </div>-->
</template>

<script lang='ts' setup>
import { computed, inject, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getSummaryParticipantProject } from '@/apps/work/api/graphql/project';
import DonutChart from '@/apps/work/views/project/component/detail/general-info/DonutChart.vue';
import ResultChart from '@/apps/work/views/project/component/detail/general-info/ResultChart.vue';
import SummaryChart from '@/apps/work/views/project/component/detail/general-info/SummaryChart.vue';

import { type ProjectStatistic, type SummaryTaskProject, } from './type';

const props = defineProps({
  projectId: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();

const activeIndex = ref<number>(0);
const {
  load,
  result,
  refetch
} = getSummaryParticipantProject(props.projectId || '');
const projectStatistic = computed<ProjectStatistic>(() => {
  return { participant: result.value?.getSummaryParticipantProject || [] };
});

watch(() => props.projectId, projectId => {
  if (projectId) {
    load(null, { projectId }) || refetch({ projectId });
  }
}, { immediate: true });

const summaryTaskProject = inject('summaryTaskProject', toRef({} as SummaryTaskProject));

</script>

<style lang='scss' scoped>

.summary-bar {
  background-color: rgb(251, 173, 76);
}

</style>