<template>
  <Toolbar class='align-content-center max-h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.role.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mb-2 mr-1 mt-2'>
        <Button
          v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ROLE/CREATE')"
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label="t('common.create')"
          @click='showRoleFormDialog'/>
      </div>
    </template>
  </Toolbar>
  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      :value='listRole'
      v-bind='DEFAULT_DATATABLE_CONFIG'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t('common.emptyRecords', {
            itemType: toLower(t('admin.role.objectName')),
          })
        }}</span>
      </template>

      <Column
        body-class='justify-content-center text-center'
        :header='t("common.ordinalNumber")'>
        <template #body='{ index }'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        field='code'
        :header="t('admin.role.code')"></Column>

      <Column
        field='name'
        :header="t('admin.role.name')"></Column>

      <Column
        field='description'
        :header="t('common.description')"></Column>

      <Column
        class='text-center'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class="`status-${status === 'ACTIVE' ? 'active' : 'deactivate'}`">{{
              t(
                `common.statuses.${status === 'ACTIVE' ? 'active' : 'deactivate'}`,
              )
            }}</span>
        </template>
      </Column>

      <Column
        v-if='menuActionsFilter.length'
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
            @click='toggleActionMenu({ event: $event, data: data })'/>
        </template>
      </Column>
    </DataTable>
  </div>

  <DynamicDialog/>
  <Menu
    ref='menuAction'
    :model='menuActionsFilter'
    :popup='true'>
    <template #item='{ item: { icon, label } }'>
      <MenuItem
        :class-icon="['mt-0 text-sm', icon === 'delete' ? 'text-red-300' : '']"
        :class-item="['mt-1', icon === 'delete' ? 'text-red-300' : '']"
        :icon='icon'
        :label='label'/>
    </template>
  </Menu>

  <RoleForm
    v-if='userFormVisible'
    :is-detail='isDetail'
    :item='role'
    :visible-dialog='userFormVisible'
    @hide-dialog='hideUserFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, toLower } from 'lodash';
import Column from 'primevue/column';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  checkExistUser,
  deleteRolePermissions,
  getRoles,
} from '@/apps/admin/api/graphql/role-graphql-api';
import type { RoleInterface } from '@/apps/admin/model/role';
import type { UserEdge } from '@/apps/admin/model/User';
import { hasPermission } from '@/apps/admin/services/permission';
import RoleForm from '@/apps/admin/views/role/RoleForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import {
  DEFAULT_DATATABLE_CONFIG,
  DEFAULT_PAGE_SIZE,
} from '@/common/constants';
import {
  toastError,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';
import type { Edge } from '@/common/model/page';
import { Direction, type Pageable } from '@/common/model/query';

const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
const searchKeyword = ref('');
const { t } = useI18n();
const listRole = ref<RoleInterface[]>([]);
const userFormVisible = ref(false);
const confirm = useConfirm();
const isDetail = ref(false);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [
    {
      property: 'name',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  keyword: '',
  pageable: pageable,
});
const role = ref<RoleInterface>({} as RoleInterface);
const selectedRow = ref();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);

const menuActions = [
  {
    label: t('common.detail'),
    icon: 'visibility',
    functionPermission: '',
    command: () => {
      isDetail.value = true;
      updateRole();
    },
  },
  {
    label: t('common.edit'),
    icon: 'edit',
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ROLE/UPDATE',
    command: () => {
      isDetail.value = false;
      updateRole();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-ROLE/DELETE',
    command: () => {
      deleteRole();
    },
  },
];
const menuActionsFilter = computed(() =>
  menuActions.filter((m) => hasPermission(m.functionPermission)),
);

const {
  refetch: getRolesRefetch,
  onResult: getRolesOnResult,
  variables: getRolesVariable,
} = getRoles(searchParams);

const {
  mutate: deleteRoleMutate,
  onDone: deleteRoleOnDone
} =
    deleteRolePermissions();
getRolesOnResult((res) => {
  listRole.value = [...listRole.value, ...res.data.getRoles.edges.map((edge: UserEdge) => edge.node)];
});

function scrollEvent(event: any) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target;
  if (
    scrollTop + clientHeight + 1 >= scrollHeight
      && !loadingMore.value
      && canLoadMore.value
  ) {
    isLoadMore.value = true;
    loadingMore.value = true;
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
  addScrollEventListener('.p-datatable-wrapper');
});

function updateRole() {
  userFormVisible.value = true;
}

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 },
  });
  reload();
}

function deleteRole() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.role.objectName'),
      itemName: role.value.name,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      checkExistUser(role.value.code).onResult((res) => {
        if (res.data.checkExistUser > 0) {
          toastError({ message: t('admin.role.message.canNotDeleteRole') });
        } else {
          deleteRoleMutate({ code: role.value.code });
        }
      });
    },
  });
}

deleteRoleOnDone(() => {
  toastSuccess({ message: t('admin.role.message.deleteSuccess') });
  reload();
});

function reload() {
  getRolesRefetch(searchParams);
}

watch(searchTerm, (newValue) => {
  listRole.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getRolesVariable.value = searchParams;
});

const menuAction = ref();

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: RoleInterface;
}) {
  menuAction.value.toggle(event);
  role.value = cloneDeep(data);
  selectedRow.value = data;
}

function hideUserFormDialog() {
  selectedRow.value = {};
  userFormVisible.value = false;
  searchParams.keyword = '';
  searchTermUpdate('');
}

function showRoleFormDialog() {
  role.value = {} as RoleInterface;
  userFormVisible.value = true;
  isDetail.value = false;
}
</script>

<script lang='ts'>
export default { name: 'RoleManager' };
</script>
