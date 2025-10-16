<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <div class='font-bold'>
          {{ t('admin.userGroup.userGroup') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-3 mr-1 my-auto'>
        <Button
          v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/CREATE')"
          class='btn-create focus:shadow-none font-normal h-2rem'
          icon='pi pi-plus'
          :label="t('common.create')"
          @click='showUserGroupFormDialog'></Button>
      </div>
    </template>
  </Toolbar>

  <div class='h-full surface-0'>
    <DataTable
      v-model:selection='selectedRow'
      :total-records='totalRecords'
      :value='userGroups'
      v-bind='DEFAULT_DATATABLE_CONFIG'
      @sort='onSort($event)'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>
          {{
            t("common.emptyRecords", {
              itemType: toLower(t("admin.userGroup.group")),
            })
          }}</span>
      </template>

      <Column
        class='text-center'
        :header='t("common.ordinalNumber")'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>

      <Column
        field='name'
        :header="t('admin.userGroup.groupName')"></Column>

      <Column
        field='username'
        :header="t('admin.userGroup.managerName')">
        <template #body='{ data: { users } }'>
          {{ getManageName(users) }}
        </template>
      </Column>

      <Column
        field='groupType'
        :header="t('admin.userGroup.groupType')">
        <template #body='{ data: { groupType } }'>
          {{ t(`common.groupType.${toLower(groupType)}`) }}
        </template>
      </Column>

      <Column
        field='description'
        :header="t('common.description')"></Column>

      <Column
        body-style='width: 13%;text-align: center'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class="`status-${status === 'ACTIVE' ? 'active' : 'deactivate'}`">{{
              t(
                `common.statuses.${status === "ACTIVE" ? "active" : "deactivate"}`,
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
            v-if="data['status'] !== STATUSES.DELETED"
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
  <UserGroupForm
    v-if='userGroupFormVisible'
    :item='userGroup'
    :visible-dialog='userGroupFormVisible'
    @hide-dialog-form='hideLogUserFormDialog'
    @reload-form='reload'/>
  <UserGroupAddForm
    v-if='userGroupAddFormVisible'
    :group='userGroup'
    :visible-dialog='userGroupAddFormVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteUserGroupGraphql,
  getUserGroupGraphql,
  lockUserGroupGraphql,
} from '@/apps/admin/api/graphql/user-group-graphql-api';
import type {
  UserGroupEdge,
  UserGroupInterface,
  UsersInterface,
} from '@/apps/admin/model/userGroup';
import { Level, UserGroup } from '@/apps/admin/model/userGroup';
import { hasPermission } from '@/apps/admin/services/permission';
import UserGroupAddForm from '@/apps/admin/views/user-group/UserGroupAddForm.vue';
import UserGroupForm from '@/apps/admin/views/user-group/UserGroupCreateOrUpdateForm.vue';
import { exportExcel } from '@/apps/meeting/api/rest/meetingApi';
import {
  DEFAULT_DATATABLE_CONFIG,
  DEFAULT_PAGE_SIZE,
  STATUSES,
} from '@/common/constants';
import {
  toastErrorData,
  toastSuccess,
} from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const loadingUserGroup = ref();
const userGroups = ref<any[]>([]);
const totalRecords = ref(0);
const userGroupFormVisible = ref(false);
const userGroupAddFormVisible = ref(false);
const searchKeyword = ref('');
const userGroup = ref<UserGroupInterface>(new UserGroup());
const dataTable = ref(null);
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const selectedRow = ref();
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
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
const {
  onResult: getUserGroupResult,
  onError: getUserGroupError,
  refetch: getRefetch,
  variables: getUserGroupVariable,
} = getUserGroupGraphql(searchParams);
getUserGroupResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.getUserGroups', {
    totalCount: 0,
    edges: [],
  });
  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingMore.value = false;
  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    userGroups.value = [
      ...userGroups.value,
      ...edges.map((edge: UserGroupEdge) => ({ ...edge.node })),
    ];
  } else {
    userGroups.value = edges.map((edge: UserGroupEdge) => ({ ...edge.node }));
  }
  isLoadMore.value = false;
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

getUserGroupError((error) => {
  loadingUserGroup.value = false;
  toastErrorData({
    prefix: 'userGroups.errors',
    error,
  });
});

const menuAction = ref();
const menuActions = ref<MenuItem[]>([]);

menuActions.value = [
  {
    label: t('common.edit'),
    icon: 'edit',
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/UPDATE',
    command: () => {
      editUserGroup();
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/DELETE',
    command: () => {
      deleteUserGroup();
    },
  },
  {
    label: t('admin.userGroup.add'),
    icon: 'add',
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-GROUP/ADD_EMPLOYEE',
    command: () => {
      addUserGroup();
    },
  },
  {
    label: t('common.lock'),
    icon: 'lock',
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/LOCK',
    command: () => {
      lockUserGroup();
    },
  },
];

function toggleActionMenu({
  event,
  data,
}: {
  event: Event;
  data: UserGroupInterface;
}) {
  menuAction.value.toggle(event);
  userGroup.value = cloneDeep(data);
  selectedRow.value = data;
}

const menuActionsFilter = computed(() =>
  menuActions.value.filter((m) => hasPermission(m.functionPermission)),
);

function reload() {
  assign(userGroup.value, new UserGroup());
  getRefetch(searchParams);
}

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 },
  });
  // reload();
}

function onPage(event: { page: number; rows: number }) {
  const {
    page,
    rows
  } = event;
  assign(pageable, {
    page,
    size: rows,
  });
  assign(searchParams, pageable);
  // reload();
}

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
  // reload();
}

function showUserGroupFormDialog() {
  userGroupFormVisible.value = true;
}

function hideLogUserFormDialog() {
  userGroup.value = new UserGroup();
  userGroupFormVisible.value = false;
  userGroupAddFormVisible.value = false;
  searchParams.keyword = '';
  searchTermUpdate('');
}

function editUserGroup() {
  userGroupFormVisible.value = true;
}

function addUserGroup() {
  userGroupAddFormVisible.value = true;
}

const {
  mutate: deleteUserGroupMutate,
  onDone: deleteUserGroupDone,
  onError: deleteUserGroupError,
} = deleteUserGroupGraphql();

const confirm = useConfirm();

function deleteUserGroup() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.userGroup.userGroupName'),
      itemName: userGroup.value.name,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteUserGroupMutate({ id: userGroup.value.id });
    },
  });
}

deleteUserGroupDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.userGroup.userGroupName'),
      itemName: userGroup.value.name,
    }),
  });
  confirm.close();
  reload();
});

deleteUserGroupError((error) => {
  toastErrorData({ error });
});

const {
  mutate: lockUserGroupMutate,
  onDone: lockUserGroupDone,
  onError: lockUserGroupError,
} = lockUserGroupGraphql();

function lockUserGroup() {
  if (userGroup.value.status == 'ACTIVE') {
    confirm.require({
      message: t('common.confirmLock', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name,
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        lockUserGroupMutate({ id: userGroup.value.id });
      },
    });
  } else {
    confirm.require({
      message: t('common.confirmUnLock', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name,
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        lockUserGroupMutate({ id: userGroup.value.id });
      },
    });
  }
}

lockUserGroupDone(() => {
  if (userGroup.value.status == 'ACTIVE') {
    toastSuccess({
      message: t('common.result.message.locked', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name,
      }),
    });
  } else {
    toastSuccess({
      message: t('common.result.message.unlocked', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name,
      }),
    });
  }

  confirm.close();
  reload();
});
lockUserGroupError((error) => {
  toastErrorData({ error });
});

function getManageName(users: UsersInterface[]) {
  const filterUser: UsersInterface[] = users.filter((item) => {
    return item.level && item.level.toString() === Level[Level.MANAGE];
  });
  return filterUser.map((item) => item.fullName).join(', ');
}

watch(searchTerm, (newValue, oldValue) => {
  userGroups.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getUserGroupVariable.value = searchParams;
});
</script>

<script lang='ts'>
export default { name: 'UserGroupManager' };
</script>

<style scoped></style>
