<template>
  <div class='body'>
    <p class='font-semibold text-blue-800'>{{ t('hrm.decision.salaryAdjustment.generalInfo') }}</p>
    <div class='formgrid grid px-2'>
      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.decisionNumber') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.noDecision }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <AppUser
          avatar-size='2'
          :user-id='decision?.createdBy'/>
        <div>
          <div class='text-sm'>
            {{ t('document.doc.docInDetail.createBy') }}<b>{{ user?.fullName }}</b>
          </div>
          <div class='text-sm'>
            {{ t('document.doc.docInDetail.time') }}
            {{
              decision?.createdTime
                ? moment(decision?.createdTime).format('HH:mm DD/MM/YYYY')
                : ''
            }}
          </div>
        </div>

      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.decisionDate') }}:</p>
        <p class='flex-1 font-semibold'>{{
          decision?.decisionDate
            ? moment(decision?.decisionDate).format('DD/MM/YYYY')
            : ''
        }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.placeOfDecision') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.placeOfDecision }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.effectiveDate') }}:</p>
        <p class='flex-1 font-semibold'>{{
          decision?.effectStartDate
            ? moment(decision?.effectStartDate).format('DD/MM/YYYY')
            : ''
        }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.expiryDate') }}:</p>
        <p class='flex-1 font-semibold'>{{
          decision?.effectEndDate
            ? moment(decision?.effectEndDate).format('DD/MM/YYYY')
            : ''
        }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.decisionMakingLevel') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.decisionMakingLevelName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.signer') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.signerName }}</p>
      </div>

      <div class='col-12 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.reason') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.reason }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.employee') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.employeeName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.welfareAdjustment') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.welfareAdjustment ? t('common.yes') : t('common.no') }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.oldDepartment') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.oldDeptName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.newDepartment') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.newDeptName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.oldJobTitle') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.oldTitleName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.newJobTitle') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.newTitleName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.oldPosition') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.oldPositionName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.newPosition') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.newPositionName }}</p>
      </div>

      <div class='col-12 flex gap-2'>
        <p class='inline-block'>{{ t('hrm.decision.salaryAdjustment.description') }}:</p>
        <p class='flex-1 font-semibold'>{{ decision?.description }}</p>
      </div>
    </div>

    <p class='font-semibold text-blue-800'>{{ t('hrm.decision.salaryAdjustment.salaryInfo') }}</p>
    <div class='formgrid grid px-2'>
      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Bậc lương cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryScaleOld }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Bậc lương mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryScaleNew }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Ngạch lương cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryGradeOld }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Ngạch lương mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryGradeNew }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Hệ số lương cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryCoefficientOld }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Hệ số lương mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryCoefficientNew }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Mức lương cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryLevelOld }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Mức lương mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.salaryLevelNew }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Lương tối thiểu vùng cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.regionalMinimumWageOld }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Lương tối thiểu vùng cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.salaryAdjustmentDecision?.regionalMinimumWageNew }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Tự động cập nhật vào quá trình diễn biến lương:</p>
        <p class='flex-1 font-semibold'>
          {{ decision?.salaryAdjustmentDecision?.isAutoUpdateProcessSalary ? 'Có' : 'Không' }}</p>
      </div>
    </div>

    <div class='flex font-semibold pt-3 text-blue-800'>
      <AppIcon
        v-tooltip='t("chat.conversation.attachment")'
        name='attachment'
        size='1.5'/>
      <p> {{ t('hrm.decision.salaryAdjustment.attachments') }}</p>
    </div>

    <div
      v-for='(file, index) in decision?.files'
      :key='index'
      class='border-round file-row flex gap-2 p-2'>
      <div
        class='cursor-pointer flex gap-2 p-2 sm:hover:surface-ground w-full'
        @click="viewDetail(file.path ?? '')">
        <img
          alt='extension'
          :src='`/images/file-extension-icons/${getFileExtension(file.name ?? "")}.svg`'
          style='width:1.75rem'>
        <div class='flex flex-column flex-grow-1'>
          <div>{{ file.name }}</div>
          <div>{{ convertFileSize(file?.size ?? 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import { GATEWAY_URL } from '@/common/api/configService';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import { convertFileSize } from '@/common/helpers/file-utils';

const props = defineProps({
  decision: {
    type: Object as PropType<DecisionInterface>,
    default: {} as DecisionInterface
  }
});
const { t } = useI18n();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const organizations = ref();
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[props.decision.createdBy],
);

function getFileExtension(fileName: string) {
  return fileName.split('.').pop();
}

getAllOrganizationGraphql().onResult((res) => {
  organizations.value = res.data?.allOrganizationPublic || [];
});

function viewDetail(filePath: string) {
  window.open(
    GATEWAY_URL
      + '/files/preview/'
      + filePath,
  );
}

function changeFileExtension(filename: string, newExtension: string): string {
  return filename.replace(/\.[^/.]+$/, `.${newExtension}`);
}
</script>

<style scoped>
.file-row {
  &:hover {
    .btnAction {
      display: block;
    }

    .file-name {
      color: #0F6CBDD6;
    }
  }
}

.btnAction {
  display: none;
}
</style>