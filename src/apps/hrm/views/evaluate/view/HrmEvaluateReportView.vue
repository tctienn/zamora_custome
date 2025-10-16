<template>
  <div class='detail-panel surface-overlay'>
    <div
      v-if='appStore.loading'
      class='loading-overlay'>
      <i class='pi pi-spin pi-spinner'></i>
    </div>
    <div class='h-full'>
      <HrmReportHeader
        v-if="activeTab !== 'SUMMARY'"
        :report='selectedReport?.report'/>
      <HrmSummaryHeader
        v-if="activeTab === 'SUMMARY'"
        :report='selectedSummaryReport?.summaryReport'/>
      <HrmEvaluateList
        v-if="activeTab !== 'SUMMARY'"
        :employees='selectedReport?.employees'/>
      <HrmEvaluateDepartmentLeaderList
        v-if="activeTab === 'SUMMARY' && selectedSummaryReport?.summaryReport.evaluateSummaryReportCode === 'VNF.M01'"
        :employees-summary='selectedSummaryReport?.detailReport?.employees'/>
      <HrmEvaluateDepartmentDeputyList
        v-if="activeTab === 'SUMMARY' && selectedSummaryReport?.summaryReport.evaluateSummaryReportCode === 'VNF.M02'"
        :employees-summary='selectedSummaryReport?.detailReport?.employees'/>
      <HrmEvaluateOfficersList
        v-if="activeTab === 'SUMMARY' && selectedSummaryReport?.summaryReport.evaluateSummaryReportCode === 'VNF.M03'"
        :employees-summary='selectedSummaryReport?.detailReport?.employees'/>
      <HrmEvaluateManagerDeputyList
        v-if="activeTab === 'SUMMARY' && selectedSummaryReport?.summaryReport.evaluateSummaryReportCode === 'VNF.M04'"
        :employees-summary='selectedSummaryReport?.detailReport?.employees'/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, type Ref } from 'vue';
import { ref } from 'vue';

import type { EvaluateReportDetail, EvaluateReportSummaryDetail } from '@/apps/hrm/model/evaluate';
import { useAppStore } from '@/common/store/app';

import HrmEvaluateDepartmentDeputyList from '../list/HrmEvaluateDepartmentDeputyList.vue';
import HrmEvaluateDepartmentLeaderList from '../list/HrmEvaluateDepartmentLeaderList.vue';
import HrmEvaluateList from '../list/HrmEvaluateList.vue';
import HrmEvaluateManagerDeputyList from '../list/HrmEvaluateManagerDeputyList.vue';
import HrmEvaluateOfficersList from '../list/HrmEvaluateOfficersList.vue';
import HrmReportHeader from './HrmReportHeader.vue';
import HrmSummaryHeader from './HrmSummaryHeader.vue';
const selectedReport = inject('selectedReport') as Ref<EvaluateReportDetail | null>;
const selectedSummaryReport = inject('selectedSummaryReport') as Ref<EvaluateReportSummaryDetail | null>;
const activeTab = inject<Ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>>('activeTab', ref<'MY_DEPT' | 'WAITING' | 'SUMMARY'>('MY_DEPT'));
const appStore = useAppStore();
</script>

<style scoped>

.detail-panel {
  height: 100%;
  position: relative;  
  flex: 1;            
}
.loading-overlay {
  position: absolute;
  inset: 0;      
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1); 
}

.loading-overlay i {
  font-size: 60px;  
  color: rgb(192, 83, 83);  
  margin-bottom: 5rem;
}
</style>