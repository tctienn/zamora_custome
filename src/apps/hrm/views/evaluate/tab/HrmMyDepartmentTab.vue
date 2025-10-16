<template>
  <Tree
    v-model:expandedKeys='expandedKeys'
    v-model:selectionKeys='selectedKey'
    scroll-height='calc(100vh - 14rem)'
    selection-mode='single'
    :value='data'
    @node-select='onSelectReport'>
    <template #default='slotProps'>
      <div
        v-if='slotProps.node.data'
        class='record-item'>
        <AppUser
          avatar-size = '2.5'
          class='mt-1'
          overlay-visible
          :user-id = 'slotProps.node.data.createdBy'/>
        <div
          class='record-content'
          @click='handleViewDetail(slotProps.node.data.id)'>
          <div class='title'>{{ slotProps.node.label }}</div>
          <div class='subtitle'>
            <span class='date'>{{ slotProps.node.data.subtitle }}</span>
            <Badge
              class='py-0 status-badge'
              :class='slotProps.node.data.status'
              :value='t(`hrm.evaluate.status.${slotProps.node.data.status}`)' />
          </div>
        </div>
        <div
          v-if='slotProps.node.data.hover && slotProps.node.data.status === StatusEvaluate.DRAFT'
          class='actions'>
          <Button
            class='action-btn'
            icon='pi pi-pencil'
            rounded
            size='small'
            text
            @click.stop='handleEdit(slotProps.node.data.id)' />
          <Button
            class='action-btn delete-btn'
            icon='pi pi-trash'
            rounded
            size='small'
            text
            @click.stop='confirmDeleteMedia(slotProps.node)' />
        </div>
      </div>
      <span v-else>{{ slotProps.node.label }}</span>
    </template>
  </Tree>
</template>

<script setup lang="ts">
import moment from 'moment';
import type { TreeNode } from 'primevue/treenode';
import { useConfirm } from 'primevue/useconfirm';
import type { Ref } from 'vue';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { type EmployeeReportDep, type EvaluateReportDetail, StatusEvaluate, type YearBlock } from '@/apps/hrm/model/evaluate';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

import { deleteEvaluateEmployeeReport, getEvaluateEmployeeReportList } from '../../../api/graphql/evaluate';
const confirm = useConfirm();
const { t } = useI18n();
const isRefresh = inject('isRefresh', ref(0));
const handleEdit = inject('handleEdit') as (id: string) => void;
const handleViewDetail = inject('handleViewDetail') as (id: string) => void;
const selectedReport = inject('selectedReport') as Ref<EvaluateReportDetail | null>;
const selectedKey = ref({});
const expandedKeys = ref<Record<string, boolean>>({});
const isFirstLoad = ref(true);
const data = ref<TreeNode[]>([]);
const {
  onResult,
  refetch,
} =
  getEvaluateEmployeeReportList();
const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} =
  deleteEvaluateEmployeeReport();
watch(isRefresh, () => {
  refetchData();
});

function onSelectReport(node: TreeNode) {
  if (node.data?.id) {
    handleViewDetail(node.data.id);
  }
}
onResult((res) => {
  const result = res.data?.getEvaluateEmployeeReportList ?? [];
  data.value = result.map((yearBlock: YearBlock) => ({
    key: `y-${yearBlock.year}`,
    label: `Năm ${yearBlock.year}`,
    style: { fontWeight: 'bold' },
    children: yearBlock.records.map((r: EmployeeReportDep) => ({
      key: r.id,
      label: r.evaluateName || 'Bảng tổng hợp đánh giá tình hình thực hiện nhiệm vụ',
      data: {
        id: r.id,
        monthReport: r.monthReport,
        subtitle: moment(r?.monthReport).format('[Tháng] M [năm] YYYY'),
        status: r.evaluateStatus,
        hover: false,
        createdBy: r.createdBy
      },
    })),
  }));
    
});

function refetchData() {
  refetch();
}

const confirmDeleteMedia = (item: TreeNode) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: item.label }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteReport(item.data.id);
    },
  });
};

const handleDeleteReport = (id: string) => {
  deleteMutate({ reportId: id });
};

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  selectedReport.value = null;
  refetchData();
});

watch(data, (newVal) => {
  if (newVal.length > 0 && isFirstLoad.value) {
    setExpandCurrentYear();
    isFirstLoad.value = false;
  }
});

function setExpandCurrentYear() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const yearKey = `y-${currentYear}`;
  expandedKeys.value = { [yearKey]: true };
  const yearNode = data.value.find(n => n.key === yearKey);
  if (yearNode && yearNode.children?.length) {
    const monthNode = yearNode.children.find(c => {
      const month = moment(c.data?.monthReport).month() + 1;
      return month === currentMonth;
    });
    if (monthNode) {
      selectedKey.value = { [monthNode.key as string]: true };
      if (monthNode.data?.id) {
        handleViewDetail(monthNode.data.id);
      }
    }
  }
}
</script>

<style scoped>
.record-item {
  display: flex;
  gap: 0.4rem;
  padding: 6px 8px;
  border-radius: 4px;
  position: relative;
}

.record-item:hover .title {
  color: #0F6CBD;
}

.record-content {
  flex: 1;
}
.title {
  font-weight: 600;
  font-size: 14px;
}
.subtitle {
  font-size: 12px;
  margin-top: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.subtitle .date{
  width: 60%;
}
.actions {
  display: flex;
  gap:5px;
  flex-direction: column;
}
.action-btn {
  width: 24px;
  height: 24px;
}

.delete-btn {
  color: #ef4444; 
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
.status-badge.WAITING_FOR_SYNTHESIS{
   background: #0D99FF; 
} 
.status-badge.DRAFT{
   background: #D9D9D9;
   color: var(--surface-900);
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

</style>