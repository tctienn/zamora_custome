<template>
  <Sidebar
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    header='Bảng thông tin theo dõi'
    position='right'
    style='width: 80rem'
    @hide='emits("hide-dialog")'>

    <DataTable
      :value='logs'
      v-bind='DEFAULT_DATATABLE_CONFIG'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t("common.emptyRecords", {
            itemType: toLower(t("theo dõi")),
          })
        }}</span>
      </template>

      <Column
        class='text-center'
        header='#'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        class='text-center'
        field='createdTime'
        :header="t('Thời gian')">
        <template #body='{data: {createdTime}}'>
          {{ createdTime ? moment(createdTime).format("HH:mm DD/MM/YYYY") : '' }}
        </template>
      </Column>

      <Column
        class='text-center'
        field='createdBy'
        :header="t('Tài khoản đăng nhập')">
        <template #body='{data: {createdBy}}'>
          <AppUser
            avatar-size='2.5'
            info-visible
            :infos='["positionName", "email"]'
            name-visible
            :user-id='createdBy'/>
        </template>
      </Column>

      <Column
        class='text-center'
        field='protocol'
        :header="t('Đơn vị')">
        <template #body='{data: {createdBy}}'>
          {{ getUserInfo(createdBy)?.departments[0].name }}
        </template>
      </Column>

      <Column
        class='text-center'
        field='actionType'
        :header="t('Hành động')">
        <template #body='{data: {actionType}}'>
          <div
            :class='`border-round-2xl surface-border text-center text-white p-1 action-${actionType}`'>
            {{ translateAction(actionType) }}
          </div>
        </template>
      </Column>

      <Column
        class='text-center'
        field='docType'
        :header="t('Loại đối tượng')">
        <template #body='{data: {docType}}'>
          {{
            docType == ObjectTypeEnum.VB_DEN ? 'Văn bản đến' : (docType == ObjectTypeEnum.VB_DI ? 'Văn bản đi' : (docType == ObjectTypeEnum.PHIEU_TRINH ? 'Phiếu trình' : ''))
          }}
        </template>
      </Column>
    </DataTable>

  </Sidebar>
</template>

<script setup lang="ts">

import { toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { findLogByObjectId } from '@/apps/document/api/graphql/log';
import { ObjectTypeEnum } from '@/apps/document/model/comment';
import { type UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { ActionType } from '@/apps/work/model/projectLog';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

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
const logs = ref();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const { t } = useI18n() || {};
const { moment } = useMoment();

const { onResult: getLogResult } = findLogByObjectId(props.docId);
getLogResult((res) => {
  logs.value = res.data.findLogByObjectId;
});

function getUserInfo(userId: string) {
  return usersMoreInfo.value[userId];
}

function translateAction(action: string) {
  if (action == ActionType.CREATE) {
    return 'Tạo';
  } else if (action == ActionType.UPDATE) {
    return 'Cập nhật';
  } else if (action == ActionType.DELETE) {
    return 'Cập nhật';
  } else if (action == ActionType.READ) {
    return 'Xem';
  } else if (action == ActionType.DOWNLOAD) {
    return 'Tải xuống';
  } else if (action == ActionType.UPLOAD) {
    return 'Tải lên';
  }
  return '';
}
</script>

<script lang="ts">
export default { name: 'SidebarFollow' };
</script>

<style scoped>
.action-CREATE {
  background: #94C748
}

.action-UPDATE {
  background: #F0BC8B
}

.action-DELETE {
  background: #BF7CD3
}

.action-READ {
  background: #69A0DC;
}

.action-DOWNLOAD {
  background: #94C748
}

.action-UPLOAD {
  background: #F0BC8B
}
</style>