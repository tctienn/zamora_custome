<template>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    lazy
    :loading='getCapacityLoading'
    :total-records='totalRecords'
    :value='capacityConfigs'
    @page='onPage($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <ButtonIcon
            icon='add_circle'
            rounded
            style='padding: 0'
            @click='openDialogFn'/>
          <span class='font-bold ml-2 text-primary text-xl'>{{
            t('admin.category.tableTitle')
          }}</span>
        </div>
      </div>
    </template>

    <Column
      field='ordinalNumber'
      header='#'>
    </Column>
    <Column :header='t("ecm.capacity.object")'>
      <template #body='{data}'>
        <span>{{ isEmpty(data.name) ? data.groupName : data.name }}</span>
      </template>
    </Column>
    <Column
      field='type'
      :header='t("ecm.capacity.typeConfig")'>>
    </Column>
    <Column
      field='capacity'
      :header='t("ecm.capacity.capacity")'>>
    </Column>
    <Column
      field='unit'
      :header='t("ecm.capacity.unit")'>>
    </Column>
    <Column
      class='text-center'>
      <template #body='{data}'>
        <ButtonIcon
          v-tooltip.top='t("common.action")'
          class='text-color'
          icon='list'
          rounded
          text
          @click='toggleActionMenu({event : $event, data : data})'/>
      </template>
    </Column>
  </DataTable>
  <Menu
    ref='menuAction'
    :model='menuActions'
    :popup='true'>
    <template #item='{item: {icon, label}}'>
      <MenuItem
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>
  <CapacityForm
    v-if='openDialog'
    :item='capacityConfig'
    :visible-dialog='openDialog'
    @hide-dialog='hideDialogFn'/>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, get, isEmpty } from 'lodash';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserServicePublic } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { deleteCapacity, getCapacities } from '@/apps/ecm/api/graphql/capacity-graphql-api';
import { getAllGroup } from '@/apps/ecm/api/graphql/group-graphql-api';
import type { CapacityConfig, CapacityConfigEdge } from '@/apps/ecm/model/capacity';
import CapacityForm from '@/apps/ecm/views/capacity/CapacityForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const getCapacityLoading = ref(false);
const totalRecords = ref(0);
const capacityConfigs = ref<CapacityConfig[]>([]);
const capacityConfig = ref<CapacityConfig>({} as CapacityConfig);
const openDialog = ref(false);
const confirm = useConfirm();
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'server',
      direction: Direction.ASC
    }
  ]
});
const { onResult: getAllGroupResult } = getAllGroup();
const { onResult: getAllUserResult } = getAllUserServicePublic();
const { mutate: deleteMutation, onDone: deleteOnDone } = deleteCapacity();
const listGroup = ref();
const listUser = ref();
const searchParams = reactive(
  { pageable: pageable }
);

getAllGroupResult((res) => {
  listGroup.value = res.data?.getAllGroup;
});

getAllUserResult((res) => {
  listUser.value = res.data?.getAllUserServicePublic;
});
const menuAction = ref();
const menuActions = ref();

function deleteConfigCapacity() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('ecm.capacity.capacityConfig').toLowerCase(),
      itemName: capacityConfig.value.type
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteMutation({ id: capacityConfig.value.id });
    }
  });
}

deleteOnDone(() => {
  toastSuccess({ message: t('common.result.message.deleted') });
  reload();
});

function editConfigCapacity() {
  openDialog.value = true;
}

function toggleActionMenu({
  event,
  data
}: { event: Event, data: CapacityConfig }) {
  menuActions.value = [
    {
      label: t('common.edit'),
      icon: 'edit',
      command: () => {
        editConfigCapacity();
      }
    },
    {
      label: t('common.delete'),
      icon: 'delete',
      command: () => {
        deleteConfigCapacity();
      }
    }
  ];
  menuAction.value.toggle(event);
  capacityConfig.value = cloneDeep(data);
}

const { onResult: searchResult, refetch: searchRefetch } = getCapacities(searchParams);

searchResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.getCapacities', {
    totalCount: 0,
    edges: []
  });
  totalRecords.value = totalCount;
  capacityConfigs.value = edges.map((edge: CapacityConfigEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));
  getCapacityLoading.value = false;
});

function openDialogFn() {
  capacityConfig.value = {} as CapacityConfig;
  openDialog.value = true;
}

function hideDialogFn() {
  openDialog.value = false;
  reload();
}

function onPage(event: { page: number, rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  reload();
}

function reload() {
  assign(capacityConfig.value, {});
  searchRefetch(searchParams);
}
</script>

<script lang="ts">
export default { name: 'CapacityManage' };
</script>

<style scoped>

</style>