<template>
  <Sidebar
    v-model:visible='visible'
    :block-scroll='true'
    :dismissable='false'
    position='right'
    :pt="{
      header: {
        class: 'border-bottom-1 border-300',
      },
    }"
    :show-close-icon='false'
    style='width: 30rem'>
    <template #header>
      <div class='align-items-center flex justify-content-between w-full'>
        <div class='align-items-center flex gap-2'>
          <Button
            icon='pi pi-arrow-left'
            severity='danger'
            @click='hideForm'/>
          <div class='p-sidebar-header-content'>
            Bảng theo dõi quá trình xử lý
          </div>
        </div>
      </div>
    </template>
    <div class='mt-2'>

      <div>
        <div class='align-items-center border-1 border-gray-300 flex font-bold justify-content-between p-2'>
          <div class='align-items-center flex gap-2'>
            <i class='pi pi-clock'></i> Bảng theo dõi quy trình xử lý
          </div>
          <AppIcon
            class='cursor-pointer'
            name='lan'
            size='1.5'
            @click='isShowFlowDialog = true'/>
        </div>
        <div
          class='border-1 border-gray-300 border-top-none p-3'
          style='height: 83.5vh'>
          <div
            v-for='(data, index) in datas'
            :key='index'
            class='mb-3'>
            <div class='flex gap-3'>
              <div>
                <AppAvatar
                  :avatar='generateAvatarUrl(usersMoreInfo[data?.handlerId]?.avatar)'
                  class='flex user-avatar'
                  :class="{
                    'success': data.result === 'APPROVE' || data.result === 'NEXT',
                    'error': data.result === 'REJECT',
                    'progress': data.result === null
                  }"
                  shape='circle'
                  size='3'/>
                <div
                  v-if='index < datas.length - 1'
                  class='line'></div>
              </div>
              <div class='flex flex-column gap-2 w-full'>
                <div class='align-items-center flex justify-content-between w-full'>
                  <div class='font-bold'>{{ usersMoreInfo[data.handlerId]?.fullName }}</div>
                  <small
                    v-if='data.createdTime'>{{ moment(data.createdTime).format('HH:mm DD/MM/YYYY') }}
                  </small>
                </div>
                <small>{{ usersMoreInfo[data.handlerId]?.positionName.join(', ') }} |
                  {{ usersMoreInfo[data.handlerId]?.departments.map(dept => dept.name).join(', ') }}</small>
                <div
                  v-if='data.content'
                  class='border-round p-2 surface-200'
                  :class='user?.id === data?.handlerId ? "bg-blue-100" : ""'>
                  {{ data.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
  <Dialog
    v-model:visible='isShowFlowDialog'
    :block-scroll='true'
    content-class='overflow-hidden'
    :dismissable-mask='true'
    :header="t('work-flow.process.flow')"
    modal>
    <div style='height: 80vh; width: 80vw'>
      <WorkFlowView
        :flow-id='selectedSummaryReport?.summaryReport?.flowId || ""'
        style='height: 80vh; width: 80vw'>
      </WorkFlowView>
    </div>
  </Dialog>
</template>

<script lang='ts' setup>
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type { Ref } from 'vue';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getHandlerOfEvaluateEmployeeSummaryReportHistory } from '@/apps/hrm/api/graphql/evaluate';
import type { EvaluateReportSummaryDetail } from '@/apps/hrm/model/evaluate';
import WorkFlowView from '@/apps/work-flow/views/config/sidebar/component/WorkFlowView.vue';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import { useUserStore } from '@/common/store/user';
const store = useUserMoreInfoStore();
const { user } = useUserStore();
const { usersMoreInfo } = storeToRefs(store);
const visible = defineModel('visible', { type: Boolean });
const isShowFlowDialog = ref(false);
const { t } = useI18n();

const selectedSummaryReport = inject('selectedSummaryReport') as Ref<EvaluateReportSummaryDetail | null>;
const datas = ref<any[]>([]);
function hideForm() {
  visible.value = false;
}
getHandlerOfEvaluateEmployeeSummaryReportHistory(selectedSummaryReport.value?.summaryReport?.id || '').onResult((res)=>{
  datas.value = res.data.getHandlerOfEvaluateEmployeeSummaryReportHistory || [];
});
</script>

<style scoped>
:deep(.p-timeline-event-opposite){
    display: none;
}

.line {
  width: 2px;
  height: 100%;
  margin: auto;
  border-left: 1px dashed #999;
}
</style>
