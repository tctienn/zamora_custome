<template>
  <Toolbar class='mb-2 p-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold ml-3'>
          {{ t(`media.common.list`) }} {{ t(`vehicle.common.titleForm`) }}
        </div>
      </div>
    </template>
    <template #end>
      <div
        class='align-items-center btn-group-toolbar flex gap-1 justify-content-center mr-1 my-1'
        style='width: 700px'>
        <TreeSelect
          v-model='deptId'
          class='w-full'
          display='chip'
          v-bind='$attrs'
          :options='organizations'
          :pt="{
            labelContainer: {
              style: 'width: 0vw',
            },
          }"
          selection-mode='single'
          @node-select='changeDept'>
        </TreeSelect>
        <Button
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          style='width: 150px'
          @click='showFormCreate'>
        </Button>
        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-export'
          label='Export'
          severity='secondary'
          style='width: 100px'></Button>
      </div>
    </template>
  </Toolbar>
  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    v-model:selection='selectedRow'
    :pt="{
      wrapper: {
        class: 'h-full surface-overlay',
      },
    }"
    row-hover
    :total-records='totalRecords'
    :value='vehicle'
    @sort='onSort($event)'>
    <Column
      class='text-center'
      header='TT'
      style='width: 5%'>
      <template #body='slotProps'>
        <div
          class='align-items-center flex items-center justify-content-center'>
          {{ slotProps.index + 1 }}
        </div>
      </template>
    </Column>
    <Column
      class='text-center'
      field='licensePlate'
      :header='t(`vehicle.common.licensePlate`)'></Column>
    <Column
      field='vehicleType'
      :header='t(`vehicle.common.nameVehicle`)'></Column>
    <Column
      class='text-center'
      field='numberOfSeats'
      :header='t(`vehicle.common.numberOfSeats`)'></Column>
    <Column
      class='text-center'
      field='yearOfManufacture'
      :header='t(`vehicle.common.yearOfManufacture`)'></Column>
    <Column
      class='text-center'
      field='frameNumber'
      :header='t(`vehicle.common.frameNumber`)'></Column>
    <Column
      class='text-center'
      field='engineNumber'
      :header='t(`vehicle.common.engineNumber`)'></Column>
    <Column
      class='text-center'
      field='status'
      :header="t('common.status')">
      <template #body='{ data: { status } }'>
        <span
          class='status-badge'
          :class="`status-${status ? 'active' : 'deactivate'}`">{{
            t(`common.statuses.${status ? 'active' : 'deactivate'}`)
          }}</span>
      </template>
    </Column>
    <Column
      class='text-center'
      :header="t('common.action')">
      <template #body='{ data }'>
        <ButtonIcon
          v-tooltip.top="t('common.action')"
          class='text-color'
          icon='more_vert'
          icon-size='1.7'
          rounded
          text
          @click='toggleActionMenu($event, data)'/>
      </template>
    </Column>
  </DataTable>

  <Menu
    ref='menuRef'
    :model='getMenusActions()'
    :popup='true'>
  </Menu>

  <VehicleForm
    v-if='showForm'
    :id='selectedRow?.id'
    :is-detail='isDetail'
    :visible-dialog='showForm'
    @hide-dialog='hideDialogFn'/>
</template>

<script lang='ts' setup>
import { assign, get } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import type { DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { deleteVehicle, searchVehicleByKeyword, } from '@/apps/vehicle/api/graphql/vehicle';
import type { IVehicle, VehicleEdge } from '@/apps/vehicle/model/vehicle';
import VehicleForm from '@/apps/vehicle/views/vehicle/VehicleForm.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { listToTree } from '@/common/helpers/utils';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n();
const searchTerm = inject('searchTerm', ref(''));

watch(searchTerm, (newValue) => {
  searchParams.keyword = newValue;
  getVehicleRefetch(searchParams);
});

const pageable = reactive({
  page: 0,
  size: 200,
  sort: [
    {
      property: 'norder',
      direction: 'ASC',
    },
  ],
});
const showForm = ref(false);
const vehicle = ref<IVehicle[]>([]);
const selectedRow = ref<IVehicle>();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const totalRecords = ref();
const menuRef = ref();
const isDetail = ref(false);
const confirm = useConfirm();
const deptId = ref<Record<string, boolean>>({});
const { user } = useUserStore();
const store = useUserMoreInfoStore();
const { usersMoreInfo } = storeToRefs(store);

const searchParams = reactive({
  keyword: '',
  organizationId: Object.keys(deptId.value).toString(),
  pageable: pageable,
});

const {
  onResult: getVehicleResult,
  refetch: getVehicleRefetch
} =
  searchVehicleByKeyword(searchParams);
const {
  mutate: deleteVehicleMutate,
  onDone: deleteVehicleOnDone
} =
  deleteVehicle();

function reload() {
  searchParams.keyword = '';
  searchParams.pageable.page = 0;
  getVehicleRefetch(searchParams);
}

const getMenusActions = () => {
  const codeOrgs = selectedRow.value && getOrgCodes(selectedRow.value.organizationId);
  const codes = usersMoreInfo.value[user.id || '']?.departments.map((item: any) => item.code);
  const hasMatch = codeOrgs && codes.some((c: string) => codeOrgs.includes(c));
  if (hasMatch) {
    return menuActions;
  } else {
    return menuActions.filter((action) => action.key === 'detail');
  }
};

getVehicleResult((res) => {
  const {
    totalCount,
    edges
  } = get(res, 'data.searchVehicleByKeyword', {
    totalCount: 0,
    edges: [],
  });
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    vehicle.value = [
      ...vehicle.value,
      ...edges.map((edge: VehicleEdge) => ({ ...edge.node })),
    ];
  } else {
    vehicle.value = edges.map((edge: VehicleEdge) => ({ ...edge.node }));
  }
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  isLoadMore.value = false;
});

function onSort(event: DataTableSortEvent) {
  const {
    sortField,
    sortOrder
  } = event;
  assign(pageable, {
    page: 0,
    sort: [
      {
        property: sortField,
        direction: sortOrder === 1 ? 'ASC' : 'DESC',
      },
    ],
  });
  assign(searchParams, pageable);
  reload();
}

function toggleActionMenu(event: Event, data: IVehicle) {
  menuRef.value.toggle(event);
  selectedRow.value = data;
}

function showFormCreate() {
  selectedRow.value = undefined;
  showForm.value = true;
}

const changeDept = (node: any) => {
  searchParams.organizationId = node.key;
  reload();
};

function hideDialogFn() {
  showForm.value = false;
  isDetail.value = false;
  selectedRow.value = undefined;
  reload();
}

function scrollEvent(event: Event) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target as HTMLElement;
  if (scrollTop + clientHeight + 1 >= scrollHeight && canLoadMore.value) {
    isLoadMore.value = true;
    searchParams.pageable.page += 1;
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-datatable-wrapper');
  });
});

const menuActions = [
  {
    key: 'detail',
    label: t('common.viewMore'),
    icon: 'pi pi-eye',
    command: () => {
      isDetail.value = true;
      showForm.value = true;
    },
  },
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      showForm.value = true;
    },
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      confirmDeleteMedia();
    },
  },
];

const confirmDeleteMedia = () => {
  confirm.require({
    message: t('common.confirmDelete', { itemName: selectedRow.value?.vehicleType, }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.cancel'),
    accept: () => {
      handleDeleteVehicle();
    },
  });
};

const handleDeleteVehicle = () => {
  deleteVehicleMutate({ id: selectedRow.value?.id });
};

deleteVehicleOnDone(() => {
  toastSuccess({ message: t('Xóa thành công') });
  reload();
});

const organizations = ref([]);
const listOrganizations = ref();
const { onResult: getAllOrganizationResult } = getAllOrganizationGraphql();
getAllOrganizationResult((response) => {
  listOrganizations.value = get(response, 'data.allOrganizationPublic', []);
  const tree = listToTree(
    listOrganizations.value.map((organization: OrganizationInterface) => ({
      key: organization.id,
      label: organization.name,
      data: organization.code,
      parentId: organization.parentCode,
      children: [],
    })),
    {
      id: 'data',
      parentId: 'parentId',
      children: 'children',
    },
  );

  tree.forEach((node: any) => {
    if (node.children) {
      node.children = node.children.map((child: any) => ({
        ...child,
        children: [],
      }));
    }
  });

  organizations.value = tree;
});

function getOrgCodes(orgId: string) {
  const org = listOrganizations.value.find((o: any) => o.id === orgId);
  if (!org) {
    return [];
  }

  const result: any[] = [];

  function dfs(currentCode: string) {
    result.push(currentCode);
    listOrganizations.value
      .filter((o: any) => o.parentCode === currentCode)
      .forEach((child: any) => dfs(child.code));
  }

  dfs(org.code);
  return result;
}
</script>

<style scoped></style>
