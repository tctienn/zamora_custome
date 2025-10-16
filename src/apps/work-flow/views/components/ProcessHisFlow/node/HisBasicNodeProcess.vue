<template>
  <div
    :class="[`border-2 border-round p-2 status-${data?.status}`,
             {'bg-gray-300':data?.status!='DA_XL'}]"
    @mouseenter='toggle'
    @mouseleave='toggle'>
    <Handle
      v-if='!isSender'
      :position='targetPosition'
      type='target'>
    </Handle>
    <Handle
      v-if='!isReceiver'
      :position='sourcePosition'
      type='source'/>
    <div class='align-items-start flex flex-column gap-2'>
      <div class='align-items-start flex'>
        <AppUserDeptRole
          avatar-size='2.5'
          info-visible
          :infos='["positionName","roleName","deptName"]'
          name-visible
          :user-dept-role='userDeptRole'>
        </AppUserDeptRole>
        <AppIcon
          v-if='data?.status=="DA_XL"'
          v-tooltip='"Đã xử lý"'
          class='cursor-pointer'
          name='done'
          size='1.5'
          :style='{color:"green"}'/>
      </div>
      <div
        v-if='data?.delegateInfoId'
        class='flex flex-column gap-2'>
        {{ t('Ủy quyền xử lý') }}
        <AppUser
          name-visible
          :user-id='delegateInfo?.toUser'/>
      </div>
    </div>
    <template v-if="viewDetailType==='inNode'">
      <div>
        <div class='font-semibold my-2 py-2'>
          Nhận
        </div>
        <LabelValueGrid>
          <LabelValueItem
            label='Thời gian nhận'
            :value='formatDateTime(data?.sendTime)'/>
          <LabelValueItem
            label='Thời gian hoàn thành'
            :value='formatDateTime(data?.completeTime)'/>
        </LabelValueGrid>
      </div>
      <Divider/>
      <div>
        <div class='font-semibold my-2 py-2'>
          Gửi
        </div>
        <LabelValueGrid>
          <LabelValueItem
            label='Thời gian gửi'
            :value='formatDateTime(data?.sendTime2)'/>
          <LabelValueItem
            label='Thời gian hoàn thành'
            :value='formatDateTime(data?.completeTime)'/>
          <LabelValueItem
            label='Ghi chú'
            :value='data?.note'/>
        </LabelValueGrid>
      </div>
    </template>
  </div>
  <OverlayPanel
    ref='op'
    class='border-1 border-round p-2 shadow-1 surface-border'
    :class="{'bg-gray-800':layoutConfig.colorScheme.value==='dark',
             'bg-white':layoutConfig.colorScheme.value==='light'}"
    :pt="{ root: { style: 'transform: translateX(-100%)' } }"
    unstyled>
    <div>
      <LabelValueGrid>
        <LabelValueItem
          label='Thời gian nhận'
          label-class='font-semibold'
          :value='data?.receiveTime ? moment(data?.receiveTime).format("HH:mm DD/MM/YYYY") : ""'/>
        <LabelValueItem
          label='Thời gian đọc'
          label-class='font-semibold'
          :value='data?.readTime ? moment(data?.readTime).format("HH:mm DD/MM/YYYY") : ""'/>
        <LabelValueItem
          label='Thời gian hoàn thành'
          label-class='font-semibold'
          :value='data?.completeTime ? moment(data?.completeTime).format("HH:mm DD/MM/YYYY") : ""'/>
        <LabelValueItem
          label='Ghi chú'
          label-class='font-semibold'
          :value='data?.note'/>
      </LabelValueGrid>
    </div>
  </OverlayPanel>
</template>

<script lang="ts" setup>
import { Handle, type Position, useHandleConnections } from '@vue-flow/core';
import type { ElementData } from '@vue-flow/core/dist/types/flow';
import moment from 'moment';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { findDelegateInfoById } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { DelegateInfoInterface } from '@/apps/admin/model/delegateInfo';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import LabelValueGrid from '@/apps/work-flow/views/components/ProcessHisFlow/LabelValueGrid.vue';
import LabelValueItem from '@/apps/work-flow/views/components/ProcessHisFlow/LabelValueItem.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { useLayout } from '@/common/components/app/composables/layout';
import { formatDateTime } from '@/common/helpers/time-util';

const props = defineProps<{
  id: string,
  data: ElementData,
  storeId?: string, hideLabel?: boolean, sourcePosition: Position | undefined,
  targetPosition: Position | undefined
  viewDetailType: 'inNode' | 'onHover'
}>();
const { layoutConfig } = useLayout();
const sourceConnections = useHandleConnections({ type: 'target', });

const targetConnections = useHandleConnections({ type: 'source', });

const { t } = useI18n();

const isSender = toRef(() => sourceConnections.value.length <= 0);

const isReceiver = toRef(() => targetConnections.value.length <= 0);
const userDeptRole = computed<UserDeptRoleInput>(() => {
  return {
    userId: props.data?.userId || '',
    userName: props.data?.userName || '',
    deptId: props.data?.deptId || '',
    deptName: props.data?.deptName || '',
    roleId: props.data?.roleId || '',
    roleName: props.data?.roleName || '',
    type: OrganizationType.ADMINISTRATIVE
  };
});
const op = ref();

function toggle(event: Event) {
  if (props.viewDetailType === 'onHover') {
    op.value.toggle(event);
  }
}

const delegateInfo = ref<DelegateInfoInterface>();
watch(() => props.data?.delegateInfoId, (value) => {
  if (value) {
    findDelegateInfoById(value).onResult(res => {
      delegateInfo.value = res.data?.findDelegateInfoById;
    });
  }
}, {
  once: true,
  immediate: true
});
</script>

<style scoped>

.status-NHAP {
  border-color: #94C748
}

.status-CHO_XL {
  border-color: #F0BC8B
}

.status-DANG_XL {
  border-color: #BF7CD3
}

.status-DA_XL {
  border-color: #69A0DC;
}

.action-PUT_IN_BOOK {
  border-color: #94C748
}

.action-SEND_CO_PROCESSING {
  border-color: #F0BC8B
}

.action-SEND_CC {
  border-color: #BF7CD3
}

.action-CC {
  border-color: #69A0DC;
}
</style>