<template>
  <DataTable
    class='full-height-table'
    data-key='id'
    :loading='loading'
    :pt='{
      thead: {
        class: "hidden"
      },
    }'
    :row-class='getRowClass'
    row-hover
    :rows='size'
    scroll-height='calc(100vh - 12.5rem)'
    scrollable
    :value='employees'>
    <template #empty>
      <ProgressBar
        v-if='loading'
        class='border-noround'
        mode='indeterminate'
        style='height: .25rem'></ProgressBar>
    </template>
    <Column
      class='text-center'
      style='max-width: 3rem'>
      <template #body='{index}'>
        {{ index + 1 + (pageable.page * pageable.size) }}
      </template>
    </Column>
    <Column
      body-class='p-0'
      style='max-width: 4rem'>
      <template #body='{data}'>
        <HrmAvatar
          :avatar='generateAvatarUrl(data["avatar"])'
          class='border-round-sm cursor-pointer'
          width='50px'
          @click='employeeIdObj.set({ id: data["id"], snapshotId: data["snapshotId"] })'/>
      </template>
    </Column>
    <Column style='max-width: 12rem'>
      <template #body='{data}'>
        <div
          class='cursor-pointer flex flex-column'
          @click='employeeIdObj.set({ id: data["id"], snapshotId: undefined })'>
          <span
            class='font-semibold white-space-nowrap'
            :class="data['status'] === 'LEAVE' && activeTab === 0 ? 'text-red' : '' ">
            {{ data['fullName'] }}
          </span>
          <span class='text-sm'>
            {{ data['code'] }}
          </span>
          <span class='text-sm'>
            {{ data['joinDate'] ? moment(data['joinDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
          </span>
        </div>
      </template>
    </Column>
    <Column style='max-width: 12rem'>
      <template #body='{data}'>
        <div class='flex flex-column'>
          <span>
            {{ data['gender'] ? t('common.gender.' + lowerCase(data['gender'])) : '' }}
          </span>
          <span class='text-sm'>
            {{ data['birthDay'] ? moment(data['birthDay']).format(DateTimeFormat.DATE_READABLE) : '' }}
          </span>
          <span class='text-sm white-space-nowrap'>
            {{
              data['homeTown'] ? (data['homeTown'].match(/.*[,-]\s*(.+)$/)?.[1]?.trim() || data['homeTown'].trim()) : ''
            }}
          </span>
        </div>
      </template>
    </Column>
    <Column style='min-width: 17rem'>
      <template #body='{data}'>
        <div class='flex flex-column'>
          <span>
            {{ data['positionName'] }}
          </span>
          <span class='text-sm'>
            {{ data['organizationName'] }}
          </span>
          <div
            v-tooltip='data["workLocation"]'
            class='overflow-hidden text-overflow-ellipsis text-sm w-full white-space-nowrap'>
            {{ data['workLocation'] }}
          </div>
        </div>
      </template>
    </Column>
    <Column>
      <template #body='{data}'>
        <div class='flex flex-column'>
          <span>
            {{ data['phoneNumber'] }}
          </span>
          <span class='text-sm'>
            {{ data['emailIssuingUnit'] }}
          </span>
          <div
            v-tooltip="data['currentAddress'] ? data['currentAddress'] + ' - ' + data['currentResidence'] : data['currentResidence']"
            class='line-limit text-sm'>
            {{
              data['currentAddress'] && data['currentResidence']
                ? data['currentAddress'] + ' - ' + data['currentResidence']
                : (data['currentAddress'] || data['currentResidence'] || '')
            }}
          </div>

        </div>
      </template>
    </Column>
    <Column style='min-width: 12rem'>
      <template #body='{data}'>
        <div class='align-items-center flex flex-column h-full'>
          <p class='mb-0 text-sm'>
            {{ convertMilliseconds(t, data.seniority) }}
          </p>
          <div class='flex gap-2 justify-content-evenly mt-1'>
            <i
              v-if='data["userId"]'
              v-tooltip='t("hrm.profile.employeeOthers.userGranted")'
              class='cursor-pointer pi pi-user'></i>
            <i
              v-if='data["isEdit"]'
              v-tooltip='t("hrm.profile.employeeOthers.profileUpdated")'
              class='cursor-pointer pi pi-check'></i>
            <i
              v-if='data["locked"]'
              v-tooltip='t("hrm.profile.employeeOthers.profileLocked")'
              class='cursor-pointer pi pi-lock'></i>
          </div>
        </div>
      </template>
    </Column>
    <Column
      align-frozen='right'
      body-class='surface-card p-2'
      frozen
      style='max-width: 4rem'>
      <template #body='{data}'>
        <Button
          icon='pi pi-ellipsis-v'
          rounded
          text
          @click='showActionMenus($event, data)'></Button>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang='ts'>
import { lowerCase } from 'lodash';
import { inject, type PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { findEmployeeById, findEmployeeByIdAndSnapshot } from '@/apps/hrm/api/rest/employee';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { Contract } from '@/apps/hrm/model/contract';
import { EmployeeSnapshotStatus, type EmployeeSummary } from '@/apps/hrm/model/employee';
import { DateTimeFormat } from '@/common/constants';
import { PROFILE_STATUS } from '@/common/constants/profile';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import { deepDiffObjects } from '@/common/helpers/utils';
import { convertMilliseconds } from '@/common/helpers/work-time-calculator';
import type { Pageable } from '@/common/model/query';
import { useHrmProfileStore } from '@/common/store/hrm-profile';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number,
    default: 0
  },
  pageable: {
    type: Object as PropType<Pageable>,
    default: null
  },
  employees: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: Number,
    default: 0
  },
  employeeSelected: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['menu:showAction', 'data:profileEdit', 'data:detailVisible', 'data:employeeSelected']);
const { t } = useI18n();
const { moment } = useMoment();
const hasPermission = usePermissionStore().hasPermission;
const hrmStore = useHrmProfileStore();
const {
  setChangedProperties,
  resetChangedProperties
} = hrmStore;
const employeeSelectedLocal = ref<string | null>(null);
const snapshotSelectedLocal = ref<string | null | null>(null);
const snapshotStatus = inject('snapshotStatus', ref<EmployeeSnapshotStatus>());
const changeProperties = ref<string[]>([]);
const showActionMenus = (e: Event, data: Contract) => {
  emits('menu:showAction', e, data);
};

watchEffect(() => {
  employeeSelectedLocal.value = props.employeeSelected;
});

const employeeIdObj = inject('employeeId', {
  get: () => ({
    id: '',
    snapshotId: undefined
  }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set: (_val: { id: string; snapshotId?: string }) => {
  } // Placeholder for injection, will be overridden in parent
});

// Theo dõi sự thay đổi của employeeId và gọi viewDetail
watch(
  () => employeeIdObj.get(),
  (newVal, oldVal) => {
    if (newVal && newVal.id && hasPermission('/HRM/HRM_PROFILE/HRM_PROFILE_CURRENT/VIEW')) {
      viewDetail(newVal.id, newVal.snapshotId);
    }
  }
);

const getRowClass = (rowData: EmployeeSummary) => {
  if (snapshotStatus.value === 'PENDING') {
    return rowData.snapshotId === snapshotSelectedLocal.value ? 'highlight-row' : '';
  }
  return rowData.id === employeeSelectedLocal.value ? 'highlight-row' : '';
};

const viewDetail = async (id: string, snapshotId?: string) => {
  resetChangedProperties();
  if (!snapshotId || snapshotStatus.value === PROFILE_STATUS.ACTIVE) {
    findEmployeeById(id).then(e => {
      if (e) {
        employeeSelectedLocal.value = id;
        emits('data:profileEdit', e);
        emits('data:detailVisible', true);
        emits('data:employeeSelected', id);
      }
    });
  } else {
    const [current, snapshot] = await Promise.all([
      findEmployeeById(id),
      findEmployeeByIdAndSnapshot(id, snapshotId)
    ]);

    if (snapshot) {
      employeeSelectedLocal.value = id;
      snapshotSelectedLocal.value = snapshotId;
      emits('data:profileEdit', snapshot);
      emits('data:detailVisible', true);
      emits('data:employeeSelected', id);

      if (current) {
        changeProperties.value = deepDiffObjects(current, snapshot);
        if (snapshotStatus.value === 'PENDING') {
          setChangedProperties(changeProperties.value);
        }
      }
    }
  }
};

</script>

<style lang='scss' scoped>
::v-deep(.status-badge) {
  text-transform: unset !important;
}

::v-deep(.highlight-row) {
  background: #e9ecef;
  color: #495057;
}
</style>