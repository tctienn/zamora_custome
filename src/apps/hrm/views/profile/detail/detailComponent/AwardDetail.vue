<template>
  <div class='flex flex-column gap-2 w-full'>
    <div
      class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mr-2 py-3 surface-0'
      style='height: 40px'>
      <div
        class='font-bold pl-3 text-lg text-primary'>{{ t('hrm.profile.award.title') }}
      </div>
    </div>

    <div
      class='grid grid-nogutter pb-3 px-0 surface-0'>
      <div
        v-for='(reward, idx) in rewardData'
        :key='idx'
        class='col-6 item-grid p-2'>
        <div class='border-1 border-round-lg p-2 surface-border'>
          <div class='border-bottom-1 flex gap-2 surface-border'>
            <AppIcon
              v-if='reward.decisionType === "COMMENDATION"'
              class='text-yellow-500'
              :fill='true'
              name='award_star'
              size='1.25'/>
            <AppIcon
              v-if='reward.decisionType === "DISCIPLINE"'
              class='text-yellow-500'
              :fill='true'
              name='gavel'
              size='1.25'/>
            <div
              class='font-medium mb-2'
              :class='{
                "text-red-300" : reward.decisionType === "DISCIPLINE",
                "text-green-500" : reward.decisionType === "COMMENDATION"
              }'>{{ formatDate(reward.decisionDate, 'DD/MM/YYYY') }}
              <span
                class='font-bold ml-2 text-lg'>{{
                reward.decisionType === 'DISCIPLINE' ? 'Kỉ luật' : 'Khen thưởng'
              }}</span>
            </div>

          </div>
          <div
            class='p-4'>
            <div v-if='reward.decisionType === "COMMENDATION"'>
              <div class='col-12 flex gap-2 pb-1 pl-0 pt-0'>
                <div class='font-bold w-12rem'>Số quyết định</div>
                <div class='font-semibold'>: {{ reward.noDecision }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Ngày quyết định</div>
                <div class='font-semibold'>: {{ reward.decisionDate }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Năm khen thưởng</div>
                <div class='font-semibold'>: {{ formatDate(reward.effectStartDate, 'YYYY') }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Cấp khen thưởng</div>
                <div class='font-semibold'>: {{ reward.decisionMakingLevelName }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Danh hiệu</div>
                <div class='font-semibold'>
                  : {{
                    reward.employeeCommendations[0]?.title ? getHornorTitle(reward.employeeCommendations[0].title) : ''
                  }}
                </div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Hình thức khen thưởng</div>
                <div class='font-semibold'>
                  : {{
                    reward.employeeCommendations[0]?.form ? getFormReward(reward.employeeCommendations[0].form) : ''
                  }}
                </div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Số tiền</div>
                <div class='font-semibold'>
                  : {{
                    reward.employeeCommendations[0]?.reward ? `${formatCurrency(reward.employeeCommendations[0].reward)} đ` : ''
                  }}
                </div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Người ký</div>
                <div class='font-semibold'>
                  : {{ getLeaderName(reward.signerId) }}
                </div>
              </div>
            </div>
            <div
              v-if='reward.decisionType === "DISCIPLINE"'>
              <div class='col-12 flex gap-2 pb-1 pl-0 pt-0'>
                <div class='font-bold w-12rem'>Số quyết định</div>
                <div class='font-semibold'>: {{ reward.noDecision }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Ngày quyết định</div>
                <div class='font-semibold'>: {{ reward.decisionDate }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Năm kỉ luật</div>
                <div class='font-semibold'>: {{ formatDate(reward.effectStartDate, 'YYYY') }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Cấp kỉ luật</div>
                <div class='font-semibold'>: {{ reward.decisionMakingLevelName }}</div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Lý do</div>
                <div class='font-semibold'>
                  : {{ getReasonDisciplines(reward.reason) }}
                </div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Hình thức kỉ luật</div>
                <div class='font-semibold'>
                  : {{
                    reward.employeeDisciplines[0]?.form ? getFormDisciplines(reward.employeeDisciplines[0].form) : ''
                  }}
                </div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Mức bồi hoàn</div>
                <div class='font-semibold'>
                  : {{
                    reward.employeeDisciplines[0]?.compensationAmount ? `${formatCurrency(reward.employeeDisciplines[0].compensationAmount)} đ` : ''
                  }}
                </div>
              </div>
              <div class='col-12 flex gap-2 pb-1 pl-0'>
                <div class='font-medium w-12rem'>Người ký</div>
                <div class='font-semibold'>
                  : {{ getLeaderName(reward.signerId) }}
                </div>
              </div>
            </div>
            <!-- Tệp đính kèm -->
            <div class='mt-4'>
              <div class='font-medium mb-2'>Tệp đính kèm :</div>
              <div class='flex flex-wrap gap-4'>
                <div
                  v-for='(file, index) in reward.files'
                  :key='index'
                  class='align-items-center border-1 border-round cursor-pointer file-item flex flex-column p-2 surface-border w-8rem'
                  @click='viewDetail(file)'>
                  <i class='mb-1 pi pi-file-pdf text-3xl text-red-500'></i>
                  <div class='text-600 text-center text-xs truncate w-full'>
                    {{ file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>

  <Menu
    ref='menuRef'
    :model='menus'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <DialogPreviewFile
    v-if='visiblePreviewFile'
    :name='selectedFile.name'
    :url='selectedFile.path'
    :visible='visiblePreviewFile'
    @hide-dialog='visiblePreviewFile = false'/>
</template>

<script lang='ts' setup>

import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import { getAllByReasonType, getAllCategory } from '@/apps/hrm/api/graphql/category';
import { getDecisionCommendationAndDisciplineAndStatusApprove } from '@/apps/hrm/api/graphql/employee';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import {
  generateDownloadUrl,
  generatePreviewFileUrl
} from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';

import { formatDate } from '../../../../../../common/helpers/utils';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const store = useUserMoreInfoStore();
const { allUsers } = storeToRefs(store);
const { t } = useI18n();
const selectedRow = ref();
const menuRef = ref();
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const rewardData = ref<any[]>([]);
const visiblePreviewFile = ref(false);
const selectedFile = ref<any>();
const { onResult: hornorTitleResult } = getAllCategory(userDeptRole.value, 'HONOR_TITLE');
const { onResult: getData } = getDecisionCommendationAndDisciplineAndStatusApprove(props.employeeId);
const { onResult: formRewardResult } = getAllCategory(userDeptRole.value, 'FORM_REWARD');
const { onResult: reasonResult } = getAllByReasonType('REASON_DISCIPLINE');
const { onResult: disciplinaryFormResult } = getAllCategory(userDeptRole.value, 'DISCIPLINARY_FORM');

function viewDetail(file: any) {
  selectedFile.value = file;
  visiblePreviewFile.value = true;
}

const menus = ref([
  {
    key: 'view',
    label: t('hrm.profile.fileFolder.fileActionOpen'),
    command: () => {
      if (!selectedRow.value?.path) {
        return;
      }
      const fileUrl = generatePreviewFileUrl(selectedRow.value.path);
      if (!fileUrl) {
        return;
      }
      const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
      const isViewable = viewableExtensions.includes(selectedRow.value.extension.toLowerCase());
      if (isViewable) {
        window.open(fileUrl, '_blank');
      }
    },
  },
  {
    key: 'download',
    label: t('hrm.profile.fileFolder.fileActionDownload'),
    command: () => {
      generateDownloadUrl(selectedRow.value.path);
    },
  },
]);

const hornorTitle = ref<any[]>([]);
const reasons = ref<any[]>([]);
const formRewards = ref<{ code: string, name: string }[]>([]);
const formDisciplines = ref<{ code: string, name: string }[]>([]);
const leaderUsers = ref<any[]>([]);
const getHornorTitle = (id: string) => {
  const honor = hornorTitle.value.find((item) => item.code === id);
  return honor?.name;
};

const getReasonDisciplines = (id: string) => {
  const reason = reasons.value.find((item) => item.code === id);
  return reason?.name;
};

const getFormDisciplines = (id: string) => {
  const form = formDisciplines.value.find((item) => item.code === id);
  return form?.name;
};

const getFormReward = (id: string) => {
  const form = formRewards.value.find((item) => item.code === id);
  return form?.name;
};

const formatCurrency = (value: string) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getLeaderName = (userId: string) => {
  const leader = leaderUsers.value.find((user) => user.id === userId);
  return leader?.fullName;
};

onMounted(() => {
  getData((res) => {
    const data = res?.data;
    if (data?.getDecisionCommendationAndDisciplineAndStatusApprove) {
      rewardData.value = data.getDecisionCommendationAndDisciplineAndStatusApprove;
    } else {
      console.warn('getDecisionCommendationAndDisciplineAndStatusApprove not found in response', res);
    }
  });

  hornorTitleResult((res) => {
    hornorTitle.value = res.data.getAllCategory;
  });

  formRewardResult((res) => {
    formRewards.value = res.data.getAllCategory;
  });

  reasonResult((res) => {
    reasons.value = res.data.getAllByReasonType;
  });

  disciplinaryFormResult((res) => {
    formDisciplines.value = res.data.getAllCategory;
  });

  getAllUserServicePublic().onResult((res) => {
    leaderUsers.value = res.data.getAllUserServicePublic.filter((user: any) => user.roles?.includes('LANH_DAO'));
  });
});
</script>

<style lang='scss' scoped>
.file-name-text {
  max-width: 160px; /* hoặc tuỳ chỉnh phù hợp với table của bạn */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.file-name-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 1; /* Chỉ hiển thị 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: 1.5em; /* Tuỳ font-size mà chỉnh */
  line-height: 1.5em;
}

.file-item:hover {
  background-color: #E5F3FF;
}

.btn-action {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  z-index: 1;
}

.selected-item {
  border: 2px solid var(--primary-color); /* hoặc màu nổi bật */
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  background-color: var(--blue-100) !important;
}

:deep(.p-selectbutton .p-button:focus) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.view-button .p-button) {
  padding: 0.3rem 0.75rem !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.75rem !important;
}

.item-grid:nth-child(2n), .item-grid:first-child {
  padding-left: 0 !important;
}
</style>