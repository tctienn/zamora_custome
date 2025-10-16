<template>
  <div class='flex justify-content-between p-3 report-header'>
    <div class='flex flex-column gap-2'>
      <template v-if='report'>
        <div><span class='font-bold uppercase'>{{ report?.evaluateName }}</span></div>
        <div><span>Đơn vị lập: {{ report?.reportOfOrganizationName }} </span></div>
        <div><span>Thời gian: {{ moment(report?.monthReport).format('[Tháng] M [năm] YYYY') }} </span></div>
        <div><span>Trạng thái: {{ t(`hrm.evaluate.status.${report?.evaluateStatus}`) || "" }} </span></div>
      </template>
      <template v-else>
        <div style='height: 1.5rem'></div>
        <div style='height: 1.3rem'></div>
        <div style='height: 1rem'></div>
        <div style='height: 1rem'></div>
      </template>
    </div>
    <div class='flex gap-1'>
      <div
        v-if='report?.evaluateStatus === StatusEvaluate.DRAFT'
        class='flex gap-1'>
        <div
          v-tooltip.bottom="'Chỉnh sửa'"
          class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
          @click='handleEdit(report?.id || "")'>
          <i class='pi pi-pencil'></i>
        </div>
        <div
          v-tooltip.bottom="'Xóa'"
          class='action-button align-items-center cursor-pointer flex hover:border-400 justify-content-center'
          @click='confirmDeleteMedia(report)'>
          <i class='delete-btn pi pi-trash'></i>
        </div>
      </div>
      <AppUser
        v-if='report?.evaluateStatus !== StatusEvaluate.DRAFT'
        avatar-size='2.2'
        overlay-visible
        :user-id = 'report?.createdBy'/>
    </div>
    
  </div>
  <div class='line-bottom'></div>
</template>

<script lang="ts" setup>
import moment from 'moment';
import { useConfirm } from 'primevue/useconfirm';
import type { PropType, Ref } from 'vue';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { deleteEvaluateEmployeeReport } from '@/apps/hrm/api/graphql/evaluate';
import { type EvaluateReportDetail, type Report, StatusEvaluate } from '@/apps/hrm/model/evaluate';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
defineProps({
  report: {
    type: Object as PropType<Report | null>,
    default: null,
  }
});
const { t } = useI18n();
const handleEdit = inject('handleEdit') as (id: string) => void;
const selectedReport = inject('selectedReport') as Ref<EvaluateReportDetail | null>;
const isRefresh = inject('isRefresh', ref(0));
const {
  mutate: deleteMutate,
  onDone: deleteOnDone
} =
  deleteEvaluateEmployeeReport();
const confirm = useConfirm();

const confirmDeleteMedia = (item: Report | null) => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: item?.evaluateName }),
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
  if(id){
    deleteMutate({ reportId: id });
  }
};

deleteOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  selectedReport.value = null;
  isRefresh.value++;
});

</script>

<style scoped>
.line-bottom{
    height: 0.6rem;
    background: #edf2f7;
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