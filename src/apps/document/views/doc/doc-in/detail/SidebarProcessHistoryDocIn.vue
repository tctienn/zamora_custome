<template>
  <Sidebar
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    position='right'
    :show-close-icon='false'
    style='width: 100rem'
    @hide='emits("hide-dialog")'>
    <template #header>
      <div
        class='border-bottom-1 border-gray-500 fixed left-0 px-3 py-2 surface-0 top-0 w-full'
        style='z-index: 1000'>
        <div
          class='flex justify-content-between'>
          <div class='flex gap-2'>
            <ButtonIcon
              class='border-round-sm flex justify-content-center px-0'
              icon='arrow_back'
              severity='danger'
              size='small'
              style='width: 30px; height: 30px;'
              @click='emits("hide-dialog")'/>
            <div class='align-content-center font-semibold text-2xl'>Lịch sử xử lý</div>
          </div>

        </div>
      </div>
    </template>
    <div class='flex pt-3'>
      <AppIcon
        class='mt-3 pt-1'
        name='history'
        size='1.5'/>
      <TabView
        v-model:active-index='activeTabIndex'
        class='flex-grow-1'
        lazy
        @tab-change='tabChange'>
        <TabPanel>
          <template #header>
            Thông tin gửi nhận
          </template>
          <DataTable
            show-gridlines
            :value='incomingProcess'>
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
                  :class='`status-badge border-round-sm text-white font-medium action-${actionType}`'>
                  {{ actionName }}
                </span>
              </template>
            </column>

            <column
              class='col-2 text-center w-15rem'
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
                <div
                  :class='`border-round-sm surface-border text-center text-white font-medium p-1 status-${status}`'>
                  {{
                    status == DocStatus.NHAP ? 'Nháp' : (status == DocStatus.DA_XL ? 'Đã xử lý'
                      : (status == DocStatus.DANG_XL ? 'Đang xử lý' : status == DocStatus.CHO_XL ? 'Chờ xử lý' : ''))
                  }}
                </div>
              </template>
            </column>

          </DataTable>
        </TabPanel>
        <TabPanel
          :pt='{
            header:{
              // onClick:showOverlay
            }
          }'>
          <template #header>
            <div
              class='align-items-center flex gap-2'>
              Xem quy trình xử lý
              <!--              <AppIcon-->
              <!--                v-if='activeTabIndex==1'-->
              <!--                name='arrow_drop_down'-->
              <!--                size='1.2'></AppIcon>-->
            </div>
          </template>
          <div
            class='overflow-hidden'
            style='height:85vh;width:75vw'>
            <ProcessHisFlow
              ref='processHisFlowRef'
              :orient-type='orientType'
              :process='incomingProcess'>
            </ProcessHisFlow>
          </div>
        </TabPanel>
      </TabView>

    </div>
  </Sidebar>
  <Menu
    id='overlay_menu'
    ref='op'
    append-to='body'
    :model='items'
    :popup='true'/>
</template>

<script setup lang="ts">

import moment from 'moment';
import { storeToRefs } from 'pinia';
import type { MenuItem } from 'primevue/menuitem';
import OverlayPanel from 'primevue/overlaypanel';
import type { TabViewChangeEvent } from 'primevue/tabview';
import { type PropType, ref } from 'vue';

import { getAllProcessByDocIdForDrawRealFlow } from '@/apps/document/api/graphql/incoming-process';
import { type DocIn, DocStatus, type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { type InComingProcess } from '@/apps/document/model/process/incoming';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import NextButtonsInForm from '@/apps/document/views/doc/doc-in/component/next-buttons-infom/NextButtonsInForm.vue';
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
const { type, userDeptRole } = storeToRefs(useDocumentRolesStore());
const visible = ref(props.visibleSidebar);
const incomingProcess = ref([] as InComingProcess[]);
const processHisFlowRef = ref<InstanceType<typeof ProcessHisFlow>>();
const prevTabIndex = ref(0);
const activeTabIndex = ref<number>(0);
const op = ref<InstanceType<typeof OverlayPanel> | null>(null);
const orientType = ref<'process' | 'user'>('process');

function showOverlay(event: Event) {
  if (prevTabIndex.value == 1) {
    op.value?.toggle(event);
  }
}

function tabChange(event: TabViewChangeEvent) {
  prevTabIndex.value = event.index;
  if (event.index == 1) {
  }
}

const items = ref<MenuItem[]>([
  {
    label: 'Hướng quy trình',
    command(event) {
      orientType.value = 'process';
    },
  }, {
    label: 'Hướng người dùng',
    command(event) {
      orientType.value = 'user';
    },
  }
]);
const { onResult: getProcessResult } = getAllProcessByDocIdForDrawRealFlow(props.docId, props.userDeptRole);
getProcessResult((res) => {
  incomingProcess.value = res.data.getAllProcessByDocIdForDrawRealFlow;
});
</script>

<script lang="ts">
export default { name: 'SidebarProcessHistoryDocIn' };
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