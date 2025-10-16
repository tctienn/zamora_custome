<template>
  <div class='body'>
    <p class='font-semibold text-blue-800'>Thông tin chung</p>
    <div class='formgrid grid px-2'>
      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Số quyết định:</p>
        <p class='flex-1 font-semibold'>{{ decision?.noDecision }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <AppUser
          avatar-size='2'
          :user-id='decision?.createdBy'/>
        <div>
          <div class='text-sm'>
            {{
              t('document.doc.docInDetail.createBy')
            }}<b>{{ user?.fullName }}</b>
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
        <p class='inline-block'>Ngày quyết định:</p>
        <p class='flex-1 font-semibold'>{{
          decision?.decisionDate
            ? moment(decision?.decisionDate).format('DD/MM/YYYY')
            : ''
        }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Cấp ra quyết định:</p>
        <p class='flex-1 font-semibold'>{{ decision?.decisionMakingLevelName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Ngày hiệu lực:</p>
        <p class='flex-1 font-semibold'>{{
          decision?.effectStartDate
            ? moment(decision?.effectStartDate).format('DD/MM/YYYY')
            : ''
        }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Lý do tiếp nhận:</p>
        <p class='flex-1 font-semibold'>{{ decision?.reason }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Nơi lập:</p>
        <p class='flex-1 font-semibold'>{{ decision?.placeOfDecision }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Người ký:</p>
        <p class='flex-1 font-semibold'>{{ decision.signerName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Nhân sự:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.employeeName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Người quản lý trực tiếp:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.receptionName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Phòng ban cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.oldDeptName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Phòng ban mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions?.[0]?.newDeptName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Chức danh/Vị trí cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions[0]?.oldTitleName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Chức danh/Vị trí mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions[0]?.newTitleName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Chức vụ cũ:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions[0]?.oldPositionName }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Chức vụ mới:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDecisions[0]?.newPositionName }}</p>
      </div>

      <div class='col-12 flex gap-2'>
        <p class='inline-block'>Mô tả:</p>
        <p class='flex-1 font-semibold'>{{ decision?.description }}</p>
      </div>
    </div>

    <div class='flex font-semibold text-blue-800'>
      <AppIcon
        v-tooltip='t("chat.conversation.attachment")'
        name='attachment'
        size='1.5'/>
      <p> Tệp đính kèm</p>
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

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import { GATEWAY_URL } from '@/common/api/configService';
import AppIcon from '@/common/components/app/AppIcon.vue';
import AppUser from '@/common/components/app/AppUser.vue';
import ButtonIcon from '@/common/components/custom/ButtonIcon.vue';
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
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[props.decision.createdBy],
);

function getFileExtension(fileName: string) {
  return fileName.split('.').pop();
}

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
      color: #0F6CBDD6
    }
  }
}

.btnAction {
  display: none;
}
</style>