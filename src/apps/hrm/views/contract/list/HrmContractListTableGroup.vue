<template>
  <DataTable
    v-model:expandedRowGroups='expandedRowGroups'
    class='full-height-table sticky-rowheader'
    expandable-row-groups
    :group-rows-by='groupField'
    :loading='loading'
    :row-class='getRowClass'
    row-group-mode='subheader'
    row-hover
    :rows='size'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    :value='contractsData'
    @rowgroup-collapse='onRowGroupCollapse'
    @rowgroup-expand='onRowGroupExpand'>
    <template #groupheader='slotProps'>
      <span
        class='font-bold line-height-3 ml-2 vertical-align-middle'
        style='color: #0F6CBD'>{{
          props.groupField ? (slotProps.data[groupField] ? slotProps.data[groupField] : 'Không xác định')
          : 'Không xác định'
        }}</span>
    </template>
    <template #empty>
      <ProgressBar
        v-if='loading'
        class='border-noround'
        mode='indeterminate'
        style='height: .25rem'></ProgressBar>
    </template>
    <Column
      class='text-center'
      header='TT'
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
          :avatar='generateAvatarUrl(data["employee"]["avatar"])'
          class='border-round-sm cursor-pointer'
          width='2.5rem'
          @click='viewDetail(data)'/>
      </template>
    </Column>
    <Column
      field='code'
      :header='t("hrm.contract.general.code")'
      style='min-width: 9rem'>
      <template #body='{data}'>
        <p
          class='cursor-pointer'
          @click='viewDetail(data)'>{{ data.code }}</p>
      </template>
    </Column>
    <Column
      field='type'
      :header='t("hrm.contract.general.type")'
      style='min-width: 12rem'/>
    <Column
      field='employee.fullName'
      :header='t("hrm.contract.general.employee")'
      style='min-width: 12rem'/>
    <Column
      field='organizationName'
      :header='t("hrm.contract.general.organization")'
      style='min-width: 15rem'/>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.effectiveDate")'
      style='min-width: 11rem'>
      <template #body='{data}'>
        {{ data['effectiveDate'] ? moment(data['effectiveDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.expiryDate")'
      style='min-width: 11rem'>
      <template #body='{data}'>
        {{ data['expiryDate'] ? moment(data['expiryDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.signedDate")'
      style='min-width: 10rem'>
      <template #body='{data}'>
        {{ data['signedDate'] ? moment(data['signedDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.createdDate")'
      style='min-width: 10rem'>
      <template #body='{data}'>
        {{ data['createdTime'] ? moment(data['createdTime']).format(DateTimeFormat.DATE_READABLE) : '' }}
      </template>
    </Column>
    <Column
      body-class='text-center'
      :header='t("hrm.contract.general.status")'
      style='min-width: 12rem'>
      <template #body='{data}'>
        <Badge
          class='status-badge'
          :severity='data["status"] === "VALID" ? "success" : "danger"'
          :value="t(`hrm.contract.statusOptions.${camelcase(data['status'])}`)"></Badge>
      </template>
    </Column>
    <Column
      align-frozen='right'
      body-class='surface-card p-2'
      frozen>
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
import camelcase from 'camelcase';
import { type PropType, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import HrmAvatar from '@/apps/hrm/components/HrmAvatar.vue';
import type { Contract } from '@/apps/hrm/model/contract';
import { DateTimeFormat } from '@/common/constants';
import { generateAvatarUrl } from '@/common/helpers/file-utils';
import useMoment from '@/common/helpers/mixins/use-moment';
import type { Pageable } from '@/common/model/query';

const props = defineProps({
  groupField: {
    type: String,
    default: 'type'
  },
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
  contractsData: {
    type: Array as PropType<Contract[]>,
    default: () => []
  },
  employeeSelected: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['menu:showAction', 'show:sidebar']);
const { t } = useI18n();
const hasPermission = usePermissionStore().hasPermission;
const { moment } = useMoment();
const expandedRowGroups = ref<any[]>([]);
const employeeSelectedLocal = ref<string | null>(null);
const showActionMenus = (e: Event, data: Contract) => {
  emits('menu:showAction', e, data);
};

watchEffect(() => {
  employeeSelectedLocal.value = props.employeeSelected;
});

const getRowClass = (rowData: Contract) => {
  return rowData.id === employeeSelectedLocal.value ? 'highlight-row' : '';
};

const onRowGroupCollapse = (event: any) => {
};

const onRowGroupExpand = (event: any) => {
};

const viewDetail = (data: any) => {
  if (hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_CONTRACT/VIEW')) {
    employeeSelectedLocal.value = data.id ? data.id : '';
    emits('show:sidebar', {
      id: data.id,
      show: true
    });
  }
};

watch(
  () => [props.contractsData, props.groupField] as const,
  ([items, group]) => {
    if (!group || !items) {
      expandedRowGroups.value = [];
      return;
    }
    expandedRowGroups.value = [...new Set(items.map((item: Contract) => item[group as keyof Contract]))];
  },
  { immediate: true }
);

</script>

<style lang='scss' scoped>
.sticky-rowheader {
  ::v-deep(.p-datatable-scrollable-table > .p-datatable-tbody > .p-rowgroup-header) {
    top: 44px !important;
  }
}

::v-deep(.highlight-row) {
  background: #e9ecef;
  color: #495057;
}

:deep(.status-badge) {
  display: flex;
  justify-content: center;
  max-width: fit-content;
  margin: 0 auto;
  align-items: center;
}
</style>