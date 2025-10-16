<template>
  <Sidebar
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header='Lịch sử xử lý'
    position='right'
    style='width: 100rem'
    @hide='emits("hide-dialog")'>
    <div class='flex'>
      <TabView
        class='flex-grow-1'
        lazy
        @tab-click='tabClick'>
        <TabPanel
          header='Thông tin gửi nhận'>
          <DataTable
            :value='outgoingProcess'>
            <column
              class='text-center w-5rem'
              header='STT'>
              <template #body='{ index }'>
                {{ index + 1 }}
              </template>
            </column>

            <column
              class='text-center w-15rem'
              header='Thời gian'>
              <template #body='{ data: { sendTime } }'>
                {{ sendTime ? moment(sendTime).format('DD/MM/YYYY HH:mm') : '' }}
              </template>
            </column>

            <column
              header='Người gửi'>
              <template #body='{data}'>
                <AppUserDeptRole
                  avatar-size='2.5'
                  info-visible
                  :infos='["positionName", "deptName", "roleName"]'
                  name-visible
                  :user-dept-role='{deptId: data?.senderDeptId, roleId: data?.senderRoleId,
                                    userId: data?.senderId, deptName : data?.senderDeptName, userName: "", roleName: data?.senderRoleName, type: userDeptRole.type}'/>
              </template>
            </column>

            <column
              header='Người/Đơn vị nhận'>
              <template #body='{data}'>
                <div class='flex gap-5'>
                  <AppUserDeptRole
                    avatar-size='2.5'
                    info-visible
                    :infos='["positionName", "deptName", "roleName"]'
                    name-visible
                    :user-dept-role='{deptId: data?.receiverDeptId, roleId: data?.receiverRoleId,
                                      userId: data?.receiverId, deptName : data?.receiverDeptName, userName: "", roleName: data?.receiverRoleName, type: userDeptRole.type}'/>
                  <AppIcon
                    v-if='data?.isRead'
                    class='align-content-center'
                    name='done_all'
                    size='1.5'
                    style='color:limegreen'
                    text/>
                </div>
              </template>
            </column>

            <column
              class='col-1 text-center'
              header='Hành động'>
              <template #body='{ data: { actionName, actionType } }'>
                <span
                  v-if='actionType'
                  :class='`status-badge text-white action-${actionType}`'>
                  {{ actionName }}
                </span>
              </template>
            </column>

            <column
              class='col-2 text-center w-15rem'
              field='deadlineDate'
              header='Hạn xử lý'>
              <template #body='{ data: { deadlineDate } }'>
                {{
                  deadlineDate ? moment(deadlineDate).format('DD/MM/YYYY') : ''
                }}
              </template>
            </column>

            <column
              class='col-1 text-center'
              field='status'
              header='Trạng thái'>
              <template #body='{ data: { status } }'>
                <span
                  v-if='status'
                  :class='`status-badge text-white status-${status}`'>
                  {{
                    status == DocStatus.NHAP ? 'Nháp' : (status == DocStatus.DA_XL ? 'Đã xử lý'
                      : (status == DocStatus.DANG_XL ? 'Đang xử lý' : status == DocStatus.CHO_XL ? 'Chờ xử lý' : ''))
                  }}
                </span>
              </template>
            </column>
          </DataTable>
        </TabPanel>
        <TabPanel
          content-class='w-full h-full'
          header='Xem quy trình xử lý'>
          <div
            class='overflow-hidden'
            style='height:85vh;width:75vw'>
            <ProcessHisFlow
              ref='processHisFlowRef'
              :process='outgoingProcess'>
            </ProcessHisFlow>
          </div>
        </TabPanel>
      </TabView>

    </div>
  </Sidebar>
</template>

<script setup lang="ts">

import moment from 'moment';
import type { TabViewClickEvent } from 'primevue/tabview';
import { type PropType, ref } from 'vue';

import { findProcessByDocId } from '@/apps/document/api/graphql/outgoing-process';
import { DocStatus, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { OutgoingProcess } from '@/apps/document/model/process/outgoing';
import ProcessHisFlow from '@/apps/work-flow/views/components/ProcessHisFlow/ProcessHisFlow.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';

const props = defineProps({
  visibleSidebar: {
    type: Boolean,
    required: false
  },
  docId: {
    type: String,
    required: true
  },
  userDeptRole: {
    type: Object as PropType<UserDeptRoleInput>,
    required: true
  },
});
const emits = defineEmits(['hide-dialog']);
const visible = ref(props.visibleSidebar);
const outgoingProcess = ref([] as OutgoingProcess[]);
const processHisFlowRef = ref<InstanceType<typeof ProcessHisFlow>>();

function tabClick(event: TabViewClickEvent) {
  if (event.index == 1) {
  }
}

const { onResult: getProcessResult } = findProcessByDocId(props.docId);
getProcessResult((res) => {
  outgoingProcess.value = res.data.findProcessByDocId;
});
</script>

<script lang="ts">
export default { name: 'SidebarProcessHistoryDocOut' };
</script>

<style scoped>
.status-NHAP {
  background: #94C748
}

.status-CHO_XL {
  background: #F0BC8B
}

.status-DANG_XL {
  background: #BF7CD3
}

.status-DA_XL {
  background: #69A0DC;
}

.action-PUT_IN_BOOK {
  background: #94C748
}

.action-SEND_CO_PROCESSING {
  background: #F0BC8B
}

.action-SEND_CC {
  background: #BF7CD3
}

.action-CC {
  background: #69A0DC;
}

.action-TRANSFER_PROCESS {
  background: #00AE99;
}

.action-REJECT {
  background: #ae003d;
}

.action-RETURN {
  background: #ae2900;
}
</style>