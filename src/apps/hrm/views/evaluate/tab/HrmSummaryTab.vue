<template>
  <Tree
    v-model:expandedKeys='expandedKeys'
    v-model:selectionKeys='selectedKey'
    scroll-height='calc(100vh - 14rem)'
    selection-mode='single'
    :value='treeData'
    @node-select='onSelectReport'>
    <template #default='slotProps'>
      <div
        v-if='slotProps.node.data'
        class='record-item'>
        <AppUser
          avatar-size='2.4'
          class='mt-1'
          overlay-visible
          :user-id = 'slotProps.node.data.createdBy'/>
        <div
          class='record-content'>
          <div class='mb-1 title'>
            <span>{{ slotProps.node.label }}</span>
          </div>
                
          <div class='subtitle'>
            <span class='date'>{{ slotProps.node.data.subtitle }}</span>
            <Badge
              class='py-0 status-badge'
              :class='slotProps.node.data.status'
              :value='t(`hrm.evaluate.statusSummary.${slotProps.node.data.status}`)' />
          </div>
        </div>
      </div>
      <span v-else>{{ slotProps.node.label }}</span>
    </template>
  </Tree>
</template>

<script setup lang="ts">
import moment from 'moment';
import type { TreeNode } from 'primevue/treenode';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { type MonthBlock, type ReportSummaryReport, type YearBlockSummary } from '@/apps/hrm/model/evaluate';

import { getEvaluateEmployeeSummaryReportList } from '../../../api/graphql/evaluate';
const isRefresh = inject('isRefresh', ref(0));
const countSummaryReport = inject('countSummaryReport', ref(0));
const handleViewDetailSummary = inject('handleViewDetailSummary') as (id: string) => void;
const selectedKey = ref({});
const expandedKeys = ref<Record<string, boolean>>({});
const isFirstLoad = ref(true);
const { t } = useI18n();
const {
  onResult,
  refetch,
} =
  getEvaluateEmployeeSummaryReportList();
watch(isRefresh, () => {
  refetchData();
});

const treeData = ref<TreeNode[]>([]);
onResult((res) => {
  const result = res.data?.getEvaluateEmployeeSummaryReportList ?? [];
  countSummaryReport.value = result.reduce(
    (sum: number, y: {countEvaluateEmployeeSummaryReportStatusDraft: number}) => sum + Number(y.countEvaluateEmployeeSummaryReportStatusDraft ?? 0),
    0
  );
  treeData.value = result.map((yearBlock: YearBlockSummary) => ({
    key: `y-${yearBlock.year}`,
    label: `Năm ${yearBlock.year}`,
    style: { fontWeight: 'bold' },
    children: yearBlock.months.map((monthBlock: MonthBlock) => ({
      key: `m-${yearBlock.year}-${monthBlock.month}`,
      label: `Tháng ${monthBlock.month}`,
      style: { fontWeight: 'bold' },
      children: monthBlock.reports.length > 0 ? monthBlock.reports.map((r: ReportSummaryReport) => ({
        key: r.id,
        label: r.evaluateSummaryReportName || 'Bảng tổng hợp đánh giá',
        data: {
          id: r.id,
          subtitle: moment(r.createdTime).format('DD/MM/YYYY'),
          createdAt: moment(r.createdTime).format('DD/MM/YYYY HH:mm'),
          status: r.evaluateEmployeeSummaryReportStatus,
          createdBy: r.createdBy
        },
      })) : [{}],
    })),
  }));
});
function onSelectReport(node: TreeNode) {
  if (node.data?.id) {
    handleViewDetailSummary(node.data.id);
  }
}
function refetchData() {
  refetch();
}

watch(treeData, (newVal) => {
  if (newVal.length > 0 && isFirstLoad.value) {
    setExpandCurrentYear();
    isFirstLoad.value = false;
  }
});

function setExpandCurrentYear() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const yearKey = `y-${currentYear}`;
  const monthKey = `m-${currentYear}-${currentMonth}`;
  expandedKeys.value = {
    [yearKey]: true,
    [monthKey]: true, 
  };
}

</script>

<style scoped>
.record-item {
  display: flex;
  gap: 0.4rem;
  padding-block: 4px;
  border-radius: 4px;
  position: relative;
}

.record-item:hover .title {
  color: #0F6CBD;
}

.title {
  font-weight: 600;
  font-size: 14px;
}
.subtitle {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.subtitle .date{
  width: 60%;
}

.p-tree{
    border: none;
    padding: 0;
}
:deep(.p-tree-toggler){
  margin-right: 0;
}

:deep(.p-treenode-leaf > .p-treenode-content .p-tree-toggler) {
  display: none;
}

:deep(.p-treenode-content) {
  border: none;
  box-shadow: none;
}

.status-badge {
  text-transform: unset !important;
  border-radius: 6px;
  padding: 0 0.4rem;
  width: 40%;
  font-size: 0.8rem;
}
.status-badge.DRAFT{
   background: #D9D9D9;
   color: var(--surface-900);
} 
.status-badge.WAITING_FOR_REVIEW{
   background: #F8E69A; 
  } 
.status-badge.WAITING_FOR_APPROVAL{
   background: #CCADD7;
} 
.status-badge.APPROVED { 
  background: #CAE2B0;
} 
.status-badge.REJECTED{
   background: #da3838; 
} 
</style>