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
        class='record-item'
        :class="{ 'unread': !slotProps.node.data.isRead }">
        <AppUser
          avatar-size='2.4'
          class='mt-1'
          overlay-visible
          :user-id = 'slotProps.node.data.createdBy'/>
        <div
          class='record-content'>
          <div class='mb-1 title'>
            <span>
              {{ slotProps.node.label }}
            </span>
          </div>
          <div class='subtitle'>
            <span class='department'>{{ slotProps.node.data.subtitle }}</span>
            <Badge
              v-if='slotProps.node.data.status === StatusEvaluate.SYNTHESIZED'
              class='py-0 status-badge'
              :class='slotProps.node.data.status'
              :value='t(`hrm.evaluate.status.${slotProps.node.data.status}`)' />
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
import { inject, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { type ListOfEvaluateEmployeeReportOnEachOrganization, type MonthBlock, type ReportSummaryReport, StatusEvaluate, type YearBlockSummary } from '@/apps/hrm/model/evaluate';

import { getEvaluateEmployeeReportOfSynthesizer, markReportAsRead } from '../../../api/graphql/evaluate';
const isRefresh = inject('isRefresh', ref(0));
const { t } = useI18n();
const countWaitingReport = inject('countWaitingReport', ref(0));
const listOrganization = inject<Ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>>('listOrganization',
  ref<ListOfEvaluateEmployeeReportOnEachOrganization[]>([])
);
const handleViewDetail = inject('handleViewDetail') as (id: string) => void;
const selectedKey = ref({});
const expandedKeys = ref<Record<string, boolean>>({});
const isFirstLoad = ref(true);
const {
  onResult,
  refetch,
} =
  getEvaluateEmployeeReportOfSynthesizer();

const {
  mutate: asReadMutate,
  onDone: asReadOnDone
} = markReportAsRead();
watch(isRefresh, () => {
  refetchData();
});

const treeData = ref<TreeNode[]>([]);
onResult((res) => {
  const result = res.data?.getEvaluateEmployeeReportOfSynthesizer ?? [];
  countWaitingReport.value = result.reduce(
    (sum: number, y: {countEvaluateEmployeeReportNotSynthesized: number}) => sum + Number(y.countEvaluateEmployeeReportNotSynthesized ?? 0),
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
        label: r.evaluateName || 'Bảng tổng hợp đánh giá',
        data: {
          id: r.id,
          reportOfOrganizationId: r.reportOfOrganizationId,
          subtitle: r.reportOfOrganizationName,
          createdAt: moment(r.createdTime).format('DD/MM/YYYY HH:mm'),
          status: r.evaluateStatus,
          isRead: r.isRead,
          createdBy: r.createdBy
        },
      })) : [{}],
    })),
  }));
});
function onSelectReport(node: TreeNode) {
  listOrganization.value = [];
  if (node.data?.id) {
    handleViewDetail(node.data.id);
    asReadMutate({ reportId: node.data.id });
  }
  if (node.key && node.key.startsWith('m-') && node.children) {
    listOrganization.value = node.children.filter(child => child.data
        && child.data.status !== StatusEvaluate.SYNTHESIZED).map((child)=>({
      evaluateEmployeeReportId: child.data.id,
      evaluateEmployeeReportName: child.label,
      reportOfOrganizationId: child.data.reportOfOrganizationId,
      reportOfOrganizationName: child.data.subtitle,
      selected: true
    }));
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

asReadOnDone(() => {
  refetchData();
});

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
.subtitle .department{
  width: 60%;
}

.status-badge {
  text-transform: unset !important;
  border-radius: 6px;
  padding: 0 0.4rem;
  width: 40%;
  font-size: 0.8rem;
}

.status-badge.SYNTHESIZED { 
  background: #22c55e;
} 

.title {
  font-weight: 600;
  font-size: 14px;
}

.subtitle {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
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

.record-item.unread {
  color: #0F6CBD;
}
</style>