<template>
  <div class='decision-comp flex flex-column gap-2 w-full'>
    <div
      class='align-items-center border-1 border-300 border-round-sm flex justify-content-between mr-2 py-3 surface-0'
      style='height: 40px'>
      <div
        class='font-bold pl-3 text-lg text-primary'>{{ t('hrm.profile.decisions.title') }}
      </div>
      <SelectButton
        v-model='viewOption'
        :allow-empty='false'
        class='mr-3 view-button'
        :option-value='(val: string) => val'
        :options="['list', 'grid']">
        <template #option='slotProps'>
          <i
            :class="{
              'pi pi-bars': slotProps.option === 'list',
              'pi pi-th-large': slotProps.option === 'grid',
            }"
            style='font-size: 1.2rem'></i>
        </template>
      </SelectButton>
    </div>
    <DecisionGridView
      v-if="viewOption === 'grid'"
      :decisions='decisionsData'
      :get-decision-types='getDecisionTypes'
      @view-detail='viewDetailRow'
      @view-detail-file='viewDetail'/>
    <DecisionTableView
      v-else
      :decisions='decisionsData'
      :get-decision-types='getDecisionTypes'
      :get-leader-name='getLeaderName'
      :get-row-class='getRowClass'
      :loading='loading'
      @view-detail='viewDetailRow'
      @view-detail-file='viewDetail'/>
    
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
  <DecisionDetail
    v-if='visibleDetail'
    :decision-id='selectedDecision?.id'
    :header='"Chi tiết "+headerDetail'
    :visible='visibleDetail'
    @hide-dialog='hideDialog'/>
</template>

<script lang='ts' setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getDecisionByEmployeeId } from '@/apps/hrm/api/graphql/employee';
import { type DecisionInterface, decisionTypes } from '@/apps/hrm/model/decision';
import DecisionDetail from '@/apps/hrm/views/decision/DecisionDetail.vue';
import DecisionGridView from '@/apps/hrm/views/profile/detail/detailComponent/decisionByEmployee/DecisionGridView.vue';
import DecisionTableView
  from '@/apps/hrm/views/profile/detail/detailComponent/decisionByEmployee/DecisionTableView.vue';
import DialogPreviewFile from '@/apps/work/views/component/DialogPreviewFile.vue';
import {
  generateDownloadUrl,
  generatePreviewFileUrl
} from '@/common/helpers/file-utils';
import { formatDate } from '@/common/helpers/utils';

const props = defineProps({
  employeeId: {
    type: String,
    default: null
  },
});
const { t } = useI18n();
const selectedRow = ref();
const menuRef = ref();
const decisionsData = ref<any[]>([]);
const visiblePreviewFile = ref(false);
const selectedFile = ref<any>();
const { onResult: getData, loading } = getDecisionByEmployeeId(props.employeeId);
const viewOption = ref('list');
const visibleDetail = ref(false);
const selectedDecision = ref<DecisionInterface>();
const headerDetail = ref();

function viewDetail(file: any) {
  selectedFile.value = file;
  visiblePreviewFile.value = true;
}

function viewDetailRow(event: any) {
  if (event.decisionType == 'APPOINTMENT') {
    headerDetail.value = 'Quyết định bổ nhiệm';
  } else if (event.decisionType == 'TRANSFER') {
    headerDetail.value = 'Quyết định điều chuyển';
  } else if (event.decisionType == 'CONTRACT_TERMINATION') {
    headerDetail.value = 'Quyết định chấm dứt HĐLĐ';
  } else if (event.decisionType == 'COMMENDATION') {
    headerDetail.value = 'Quyết định khen thưởng';
  } else if (event.decisionType == 'DISCIPLINE') {
    headerDetail.value = 'Quyết định kỷ luật lao động';
  } else if (event.decisionType == 'RECEPTION') {
    headerDetail.value = 'Quyết định tiếp nhận';
  } else if (event.decisionType == 'DISMISSAL') {
    headerDetail.value = 'Quyết định miễn nhiệm';
  }
  selectedDecision.value = event;
  visibleDetail.value = true;
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

const leaderUsers = ref<any[]>([]);

const getLeaderName = (userId: string) => {
  const leader = leaderUsers.value.find((user) => user.id === userId);
  return leader?.fullName;
};

const getDecisionTypes = (type: string) => {
  return decisionTypes.find((item) => item.code === type)?.name;
};

const getRowClass = (rowData: DecisionInterface) => {
  // Check if the decision's effect end date is before today
  if (rowData.effectEndDate) {
    const endDate = new Date(rowData.effectEndDate);
    const today = new Date();
    // Reset time part for comparison (compare only dates)
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < today) {
      return 'expired-decision-row';
    }
  }
  
  // Only return class for expired decisions, no highlighting for selected row
  return '';
};

const hideDialog = () => {
  visibleDetail.value = false; 
};

onMounted(() => {
  getData((res) => {
    if (res.loading) {
      return;
    }
    const data = res?.data;
    if (data?.getDecisionByEmployeeId) {
      decisionsData.value = data.getDecisionByEmployeeId.filter((item: any) => item.status === 'APPROVED');
    } else {
      console.warn('getDecisionByEmployeeId not found in response', res);
    }
  });

  getAllUserServicePublic().onResult((res) => {
    leaderUsers.value = res.data.getAllUserServicePublic.filter((user: any) => user.roles?.includes('LANH_DAO')); 
  });
});
</script>

<style lang="scss" scoped>
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
  padding: 0.3rem 0.45rem !important;
  border-radius: 4px;
}
:deep(.p-button-group .p-button:first-of-type:not(:only-of-type)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.p-button-group .p-button:last-of-type:not(:only-of-type)) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.75rem !important;
}

:deep(.expired-decision-row) {
  background-color: var(--bg-white-custom2) !important;
}

.item-grid:nth-child(2n), .item-grid:first-child {
  padding-left: 0 !important;
}
</style>