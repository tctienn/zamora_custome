<template>
  <div class='flex justify-content-between p-3'>
    <div class='flex flex-column gap-2 wrapper-content'>
      <template v-if='report'>
        <div><span class='font-bold uppercase'>{{ report?.evaluateSummaryReportName }}</span></div>
        <div><span>Đơn vị lập: <span class='font-bold'>{{ report?.organizationCreateName }}</span> </span></div>
        <div class='flex justify-content-between'>
          <span>Thời gian: <span class='font-bold'>{{ moment(report?.monthReport).format('[Tháng] M [năm] YYYY') }}</span> </span>
          <span>Tổng số phòng ban: <span class='font-bold'>{{ report?.totalOrganization }}</span> </span>
          <span>Tổng số nhân sự: <span class='font-bold'>{{ report?.totalEmployee }}</span> </span>
        </div>
        <div><span>Trạng thái: <span class='font-bold'>{{ t(`hrm.evaluate.statusSummary.${report?.evaluateEmployeeSummaryReportStatus}`) || "" }}</span> </span></div>
      </template>
      <template v-else>
        <div style='height: 1.5rem'></div>
        <div style='height: 1.3rem'></div>
        <div style='height: 1rem'></div>
        <div style='height: 1rem'></div>
      </template>
    </div>
    <div class='align-items-end flex flex-column justify-content-between'>
      <div class='flex gap-1'>
        <div
          v-if='report?.evaluateEmployeeSummaryReportStatus === StatusEvaluate.DRAFT'
          class='flex gap-1'>
          <div
            v-tooltip.bottom="'Chỉnh sửa'"
            class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'>
            <i
              class='pi pi-pencil'
              @click='handleEditSummary(report?.id || "")'></i>
          </div>
          <div
            v-tooltip.bottom="'Xóa'"
            class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'>
            <i
              class='delete-btn pi pi-trash'
              @click='confirmDeleteMedia(report)'></i>
          </div>
        </div>
        <AppUser
          v-if='report?.evaluateEmployeeSummaryReportStatus !== StatusEvaluate.DRAFT'
          avatar-size='2.2'
          overlay-visible
          :user-id = 'report?.createdBy'/>
      </div>
      <AppGroupAvatar
        v-if='report?.createdBy'
        avatar-size='2.2'
        :user-ids='[report?.createdBy]'/>
    </div>
  </div>
  <div class='line-bottom'></div>
</template>

<script lang="ts" setup>
import moment from 'moment';
import { useConfirm } from 'primevue/useconfirm';
import type { Ref } from 'vue';
import { inject, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteEvaluateEmployeeSummaryReport } from '@/apps/hrm/api/graphql/evaluate';
import { type EvaluateReportSummaryDetail, StatusEvaluate, type SummaryReportDetail } from '@/apps/hrm/model/evaluate';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
defineProps({
  report: {
    type: Object as PropType<SummaryReportDetail | null>,
    default: null,
  }
});
const { t } = useI18n();
const handleEditSummary = inject('handleEditSummary') as (id: string) => void;
const selectedSummaryReport = inject('selectedSummaryReport') as Ref<EvaluateReportSummaryDetail | null>;
const isRefresh = inject('isRefresh', ref(0));

const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} =
  deleteEvaluateEmployeeSummaryReport();
const confirm = useConfirm();

const confirmDeleteMedia = (item: SummaryReportDetail | null) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: item?.evaluateSummaryReportName }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteReport(item?.id);
    },
  });
};

const handleDeleteReport = (id?: string) => {
  if (id) {
    deleteMutate({ reportId: id });
  }
};

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  selectedSummaryReport.value = null;
  isRefresh.value++;
});
</script>

<style scoped>
.line-bottom{
    height: 0.6rem;
    background: #edf2f7;
}

.wrapper-content{
  min-width: 40vw;
}

.action-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-color-secondary);
}

.action-button:hover {
  background: var(--surface-100);
  border-radius: 4px;
}
.delete-btn {
  color: #ef4444; 
}
</style>