<template>
  <div
    style='height: calc(100vh - 6rem)'>
    <div class='flex flex-column gap-2'>
      <Toolbar
        class='mb-2 p-0 pr-1'
        style='min-height: 3rem'>
        <template #start>
          <div class='align-items-center flex font-bold gap-2 pl-2'>
            Phiếu yêu cầu
          </div>
        </template>

        <template #end>
          <ButtonGroup>
            <Button
              v-if='hasPermission("/HRM/HRM_CONFIG/HRM_CONFIG_REQUEST/CREATE")'
              class='btn-create focus:shadow-none font-normal p-1 pr-2'
              icon='pi pi-plus'
              :label='t("common.create")'
              @click='$router.push({name: "HrmRequestCreate"})'></Button>
          </ButtonGroup>
        </template>
      </Toolbar>
    </div>
    <div class='flex-grow-1'>
      <DataTable
        group-rows-by='key'
        row-group-mode='rowspan'
        row-hover
        scroll-height='calc(100vh - 12rem)'
        sort-mode='single'
        :value='requests'
        v-bind='DEFAULT_DATATABLE_CONFIG'>
        <template #empty>
          <span class='block font-bold text-600 text-center'>{{
            t('common.emptyRecords', { itemType: 'phiếu yêu cầu' })
          }}</span>
        </template>
        <Column
          header='STT'
          header-class='w-1rem'>
          <template #body='{ index }'>
            <div class='flex justify-content-center'>
              {{ index + 1 }}
            </div>
          </template>
        </Column>

        <Column
          field='title'
          header='Tiêu đề'
          header-class='w-20rem'>
        </Column>

        <Column
          field='leaveType'
          header='Loại yêu cầu'
          header-class='w-12rem'>
        </Column>

        <Column
          field='status'
          header='Trạng thái'
          header-class='w-20rem'>
        </Column>

        <Column header-class='w-1rem'>
          <template #body='{data}'>
            <ButtonIcon
              class='btn-create'
              icon='more_vert'
              outlined
              rounded
              text
              @click='toggleActionMenu({ event: $event, data: data })'/>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <DynamicDialog/>
</template>

<script lang='ts' setup>

import { cloneDeep } from 'lodash';
import Column from 'primevue/column';
import type { MenuItem } from 'primevue/menuitem';
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { searchLeaveApplication } from '@/apps/hrm/api/graphql/leaveApplication';
import type { DecisionInterface } from '@/apps/hrm/model/decision';
import { type LeaveApplication, LeaveStatus } from '@/apps/hrm/model/leave';
import { FlowTypePredefined, useStartFlow } from '@/apps/work-flow/components/start-flow';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

const { t } = useI18n();
const requests = ref<LeaveApplication[]>();
const request = ref();
const menuAction = ref();
const router = useRouter();
const selectedRequest = ref<LeaveApplication>();
const hasPermission = usePermissionStore().hasPermission;
const {
  onResult,
  load
} = searchLeaveApplication();
const { showStartFlowDialog } = useStartFlow(FlowTypePredefined.HRM_LEAVE_APPLICATION, toRef(() => selectedRequest.value?.id));
onResult((res) => {
  requests.value = res.data.searchLeaveApplication;
});

load(undefined, { keyword: '' });

const menuActions: MenuItem[] = [
  {
    label: t('common.detail'),
    icon: 'info',
    visible: hasPermission('/HRM/HRM_CONFIG/HRM_CONFIG_REQUEST/VIEW'),
    command: () => {
      router.push({
        name: 'HrmRequestDetail',
        params: { id: selectedRequest.value?.id }
      });
    },
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    visible: hasPermission('/HRM/HRM_CONFIG/HRM_CONFIG_REQUEST/UPDATE'),
    command: () => {
      router.push({
        name: 'HrmRequestUpdate',
        params: { id: selectedRequest.value?.id }
      });
    },
  },
  {
    label: 'Start Work Flow',
    icon: 'play_arrow',
    visible: () => selectedRequest.value?.status === LeaveStatus.DRAFT && !selectedRequest.value?.workFlowId,
    command: showStartFlowDialog
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    visible: hasPermission('/HRM/HRM_CONFIG/HRM_CONFIG_REQUEST/DELETE'),
    command: () => {
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: DecisionInterface;
}) {
  menuAction.value.toggle(event);
  request.value = cloneDeep(data);
  selectedRequest.value = request.value;
}
</script>

<style scoped>

</style>