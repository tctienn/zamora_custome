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
        <p class='inline-block'>Lý do kỷ luật:</p>
        <p class='flex-1 font-semibold'>{{ decision?.reason }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Nơi lập:</p>
        <p class='flex-1 font-semibold'>{{ decision?.placeOfDecision }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Người ký:</p>
        <p class='flex-1 font-semibold'>{{ decision?.signerName }}</p>
      </div>

      <div class='col-12 flex gap-2'>
        <p class='inline-block'>Cá nhân kỷ luật:</p>
        <p class='flex-1 font-semibold'>
          {{
            decision.employeeDisciplines?.filter((e) => e.disciplineObject == 'EMPLOYEE').map((e) => e.employeeOrganizationName).join(', ')
          }}
        </p>
      </div>

      <div class='col-12 flex gap-2'>
        <p class='inline-block'>Tập thể kỷ luật:</p>
        <p class='flex-1 font-semibold'>
          {{
            decision.employeeDisciplines?.filter((e) => e.disciplineObject == 'ORGANIZATION').map((e) => e.employeeOrganizationName).join(', ')
          }}
        </p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Hình thức:</p>
        <p class='flex-1 font-semibold'>{{ findForm(decision?.employeeDisciplines?.[0]?.form) }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Mức bồi hoàn:</p>
        <p class='flex-1 font-semibold'>{{ decision?.employeeDisciplines?.[0]?.compensationAmount }}</p>
      </div>

      <div class='col-6 flex gap-2'>
        <p class='inline-block'>Hình thức thực thi:</p>
        <p class='flex-1 font-semibold'>{{ findPaymentType(decision?.employeeDisciplines?.[0]?.typeExecution) }}</p>
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

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllCategory } from '@/apps/hrm/api/graphql/category';
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
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { t } = useI18n();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);
const organizations = ref();
const forms = ref<{ name: string, code: string }[]>([]);
const { onResult: disciplinaryFormResult } = getAllCategory(userDeptRole.value, 'DISCIPLINARY_FORM');
const user = computed(
  (): UserMoreInfo => usersMoreInfo.value[props.decision.createdBy],
);

disciplinaryFormResult((res) => {
  forms.value = res.data.getAllCategory;
});

function getFileExtension(fileName: string) {
  return fileName.split('.').pop();
}

function findForm(formCode: string) {
  if (!formCode) {
    return;
  }
  return forms.value.find((f) => f.code == formCode)?.name;
}

getAllOrganizationGraphql().onResult((res) => {
  organizations.value = res.data?.allOrganizationPublic || [];
});

const paymentType = [
  {
    name: 'Đã bồi hoàn',
    code: 'REFUNDED'
  },
  {
    name: 'Trừ vào lương',
    code: 'DEDUCTED_SALARY'
  }
];

function findPaymentType(pt: string) {
  if (!pt) {
    return;
  }

  return paymentType.find((pmt: any) => pmt.code == pt)?.name;
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