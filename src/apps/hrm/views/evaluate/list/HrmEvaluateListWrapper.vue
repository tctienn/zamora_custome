<template>
  <HrmEvaluateWrapper ref='wrapperRef'>
    <template #tree>
      <TabView @tab-change='onTabChange'>
        <TabPanel>
          <template #header>
            <span class='p-tabview-title' >Phòng ban tôi</span>
          </template>
          <HrmMyDepartmentTab/>
        </TabPanel>
        <TabPanel>
          <template #header>
            <div class='flex items-center' >
              <span class='p-tabview-title' >Chờ tổng hợp</span>
              <Badge
                v-if='countWaitingReport > 0'
                class='ml-1 small-badge'
                severity='danger'
                :value='countWaitingReport'/>
            </div>
          </template>
          <HrmWaitingTab/>
        </TabPanel>
        <TabPanel>
          <template #header>
            <span class='p-tabview-title' >Tổng hợp</span>
            <Badge
              v-if='countSummaryReport > 0'
              class='ml-1 small-badge'
              severity='danger'
              :value='countSummaryReport'/>
          </template>
          <HrmSummaryTab/>
        </TabPanel>
      </TabView>
    </template>
    <template #list>
      <HrmEvaluateReportView/>
    </template>
  </HrmEvaluateWrapper>
</template>

<script lang='ts' setup>

import { inject, provide, type Ref, ref } from 'vue';

import type { EvaluateReportDetail, EvaluateReportSummaryDetail } from '@/apps/hrm/model/evaluate';

import HrmMyDepartmentTab from '../tab/HrmMyDepartmentTab.vue';
import HrmSummaryTab from '../tab/HrmSummaryTab.vue';
import HrmWaitingTab from '../tab/HrmWaitingTab.vue';
import HrmEvaluateReportView from '../view/HrmEvaluateReportView.vue';
import HrmEvaluateWrapper from './HrmEvaluateWrapper.vue';
const wrapperRef = ref<InstanceType<typeof HrmEvaluateWrapper>>();
const activeTab = inject<Ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>>('activeTab', ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>('MY_DEPT'));
const selectedReport = inject('selectedReport') as Ref<EvaluateReportDetail | null>;
const selectedSummaryReport = inject('selectedSummaryReport') as Ref<EvaluateReportSummaryDetail | null>;
const countWaitingReport = ref<number>(0);
const countSummaryReport = ref<number>(0);
function toggleTree() {
  wrapperRef.value?.toggleTree();
}
defineExpose({ toggleTree });

function onTabChange(e: { index: number }) {
  if (e.index === 0) {
    selectedSummaryReport.value = null;
    activeTab.value = 'MY_DEPT';
  } else if (e.index === 1) {
    selectedSummaryReport.value = null;
    activeTab.value = 'WAITING';
  } else if (e.index === 2) {
    selectedReport.value = null;
    activeTab.value = 'SUMMARY';
  }
}

provide('countWaitingReport', countWaitingReport);
provide('countSummaryReport', countSummaryReport);
</script>

<style scoped>
:deep(.p-tabview-panels){
    padding: 0.5rem;
}

.small-badge {
  font-size: 0.85rem;    
  height: 1.35rem;        
  min-width: 1.35rem;    
  line-height: 1.40rem;  
  padding: 0 0.4rem;      
}

:deep(.p-tabview-title){
  line-height: 1.35rem;
}
:deep(.p-badge.p-badge-danger){
  background: #F36F24;
}
</style>
