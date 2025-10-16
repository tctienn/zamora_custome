<template>
  <DataTable
    v-model:expandedRows='expandedRows'
    v-model:selection='selectedRow'
    class='full-height-table'
    data-key='id'
    :loading='loading'
    :pt='{
      rowexpansioncell: {
        class: "p-0"
      }
    }'
    :row-class='getRowClass'
    row-hover
    :rows='size'
    scroll-height='calc(100vh - 12rem)'
    scrollable
    :value='contractsData'>
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
      style='max-width: 6rem'>
      <template #body='{ data }'>
        <div class='align-items-center flex gap-2'>
          <AppIcon
            class='cursor-pointer mx-2'
            :name="expandedRows[data.id] ? 'expand_more' : 'keyboard_arrow_right'"
            size='1.7'
            style='margin-top: 2px'
            :style='data.hasContractAppendix ? {} : {visibility: "hidden"}'
            @click='toggleRow(data)'/>
          <HrmAvatar
            :avatar='generateAvatarUrl(data?.employee?.avatar)'
            class='border-round-sm cursor-pointer'
            width='2.5rem'
            @click='viewDetail(data)'/>
        </div>
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
          class='py-0 status-badge'
          :severity='data["status"] === "VALID" ? "success" : "danger"'
          :value="t(`hrm.contract.statusOptions.${camelcase(data['status'])}`)"></Badge>
      </template>
    </Column>
    <Column
      body-class='text-center'
      style='width: 1rem'>
      <template #body='{data}'>
        <AppIcon
          v-if='data.attachments?.length'
          name='attach_file'
          size='1.3'></AppIcon>
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

    <template #expansion='{data}'>
      <DataTable
        :pt='{
          thead: {
            class: "hidden"
          },
        }'
        row-hover
        :value='contractAppendixes.filter((item: any) => item.contractId === data.id)'>
        <Column
          class='text-center'
          header='TT'
          style='max-width: 3rem'>
          <template #body='{index}'>
            {{ index + 1 + (pageable.page * pageable.size) }}
          </template>
        </Column>
        <Column
          field='numContractAppendix'
          :header='t(`hrm.contract.numContractAppendix`)'>
          <template #body='{data}'>
            <div
              class='cursor-pointer'
              @click='showDetailContractAppendix($event, data)'>{{
                data.numContractAppendix
              }}
            </div>
          </template>
        </Column>
        <Column
          field='content'
          :header='t(`hrm.contract.content`)'></Column>
        <Column
          field='signDate'
          :header='t(`hrm.contract.signDate`)'>
          <template #body='{data}'>
            {{ data['signDate'] ? moment(data['signDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
          </template>
        </Column>
        <Column
          field='effectiveDate'
          :header='t(`hrm.contract.effectiveDate`)'>
          <template #body='{data}'>
            {{ data['effectiveDate'] ? moment(data['effectiveDate']).format(DateTimeFormat.DATE_READABLE) : '' }}
          </template>
        </Column>
        <Column
          field='signatory'
          :header='t(`hrm.contract.signatory`)'></Column>
        <Column
          body-class='text-center'
          :header='t("hrm.contract.general.status")'>
          <template #body='{data}'>
            <Badge
              class='py-0 status-badge'
              :severity='data["status"] ? "success" : "danger"'
              :value='data.status ? t(`hrm.contract.stillEffect`) : t(`hrm.contract.expire`)'></Badge>
          </template>
        </Column>
        <Column
          align-frozen='right'
          body-class='surface-card p-0'
          frozen>
          <template #body='{data}'>
            <Button
              icon='pi pi-ellipsis-v'
              rounded
              text
              @click='showActionMenusContractAppendix($event, data)'></Button>
          </template>
        </Column>
      </DataTable>
    </template>
  </DataTable>
</template>

<script setup lang='ts'>
import camelcase from 'camelcase';
import { cloneDeep } from 'lodash';
import { type PropType, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePermissionStore } from '@/apps/admin/store/permission';
import { getAllContractAppendix, getAllContractAppendixInContracts } from '@/apps/hrm/api/graphql/contract';
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

const emits = defineEmits(['menu:showAction', 'show:sidebar', 'menu:showActionContractAppendix', 'show:detail']);
const hasPermission = usePermissionStore().hasPermission;
const { t } = useI18n();
const { moment } = useMoment();
const employeeSelectedLocal = ref<string | null>(null);
const showActionMenus = (e: Event, data: Contract) => {
  emits('menu:showAction', e, data);
};
const showActionMenusContractAppendix = (e: Event, data: any) => {
  emits('menu:showActionContractAppendix', e, data);
};
const showDetailContractAppendix = (e: Event, data: any) => {
  emits('show:detail', e, data);
};
const expandedRows = ref<Record<string, boolean>>({});
const contractAppendixes = ref<any>([]);
const selectedRow = ref();

watchEffect(() => {
  employeeSelectedLocal.value = props.employeeSelected;
});

const toggleRow = (row: any) => {
  if (expandedRows.value[row.id]) {
    delete expandedRows.value[row.id];
  } else {
    expandedRows.value[row.id] = true;
    selectedRow.value = row;
  }
  if (expandedRows.value[row.id]) {
    getContractAppendix(row.id);
  }
};

const getContractAppendix = (id: string) => {
  contractAppendixes.value = contractAppendixes.value.filter((item: any) => item.contractId !== id);
  getAllContractAppendix(id).onResult(res => {
    contractAppendixes.value = [
      ...new Map(
        [...contractAppendixes.value, ...cloneDeep(res.data.getAllContractAppendix)]
          .map(item => [item.id, item])
      ).values()
    ];
  });
};

const refetchContractAppendix = () => {
  const ids = Object.keys(expandedRows.value);
  getAllContractAppendixInContracts(ids).onResult((res) => {
    contractAppendixes.value = res.data.getAllContractAppendixInContracts;
  });
};

const getRowClass = (rowData: Contract) => {
  return rowData.id === employeeSelectedLocal.value ? 'highlight-row' : '';
};

const viewDetail = (data: Contract) => {
  if (hasPermission('/HRM/HRM_CONTRACT_DECISION/HRM_CONTRACT/VIEW')) {
    employeeSelectedLocal.value = data.id ? data.id : '';
    emits('show:sidebar', {
      hdTemplate: data.hdTemplate,
      id: data.id,
      show: true
    });
  }
};

defineExpose({ refetchContractAppendix });
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