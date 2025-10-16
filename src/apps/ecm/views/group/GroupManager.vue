<template>

  <DataTable
    v-bind='DEFAULT_DATATABLE_CONFIG'
    lazy
    :loading='loadingUserGroup'
    :total-records='totalRecords'
    :value='userGroups'
    @page='onPage($event)'
    @sort='onSort($event)'>
    <template #header>
      <div class='align-items-center flex flex-wrap justify-content-between'>
        <div class='align-items-center column-gap-2 flex flex-row'>
          <ButtonIcon
            icon='add_circle'
            rounded
            text
            @click='showUserGroupFormDialog'/>
          <span class='font-bold text-primary text-xl'>{{ t('admin.userGroup.userGroup') }}</span>
        </div>

        <div class='search-input-wrapper'>
          <InputGroup>
            <IconField
              class='w-full'
              icon-position='left'>
              <InputIcon class='pi pi-search'/>
              <InputText
                v-model='searchKeyword'
                class='w-full'
                :placeholder='t("common.search")'
                @keyup.enter='searchDatatable'/>
            </IconField>
          </InputGroup>
        </div>
      </div>
    </template>

    <template #empty>
      <span class='block font-bold text-600 text-center'>{{
        t('common.emptyRecords', {itemType: toLower(t('admin.userGroup.group'))})
      }}</span>
    </template>

    <Column
      field='ordinalNumber'
      header='#'>
    </Column>

    <Column
      field='name'
      :header='t("admin.userGroup.groupName")'
      :sortable='true'>
    </Column>

    <Column
      field='groupLeaderId'
      :header='t("admin.userGroup.managerName")'>
      <template #body='{data: {users}}'>
        {{ getManageName(users) }}
      </template>
    </Column>

    <Column
      field='description'
      :header='t("common.description")'>
    </Column>

    <Column
      field='status'
      :header='t("common.status")'
      :sortable='true'>
      <template #body='{data: {status}}'>
        <span
          class='status-badge'
          :class='`status-${status === "ACTIVE" ? "active" : "deactivate"}`'>{{
            t(`common.statuses.${status === 'ACTIVE' ? 'active' : 'deactivate'}`)
          }}</span>
      </template>
    </Column>

    <Column
      class='text-center'
      :header='t("common.action")'>
      <template #body='{data}'>
        <ButtonIcon
          v-if='data["status"] !== STATUSES.DELETED'
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
  <GroupForm
    v-if='userGroupFormVisible'
    :item='userGroup'
    :visible-dialog='userGroupFormVisible'
    @hide-dialog-form='hideLogUserFormDialog'
    @reload-form='reload'/>
  <FormAddUser
    v-if='userGroupAddFormVisible'
    :group='userGroup'
    :visible-dialog='userGroupAddFormVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>

  <FormDecentralization
    v-if='formDecentralizationVisible'
    :group='userGroup'
    :visible-dialog='formDecentralizationVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>

  <FormGroupDetail
    v-if='formGroupDetailVisible'
    :item='userGroup'
    :visible-dialog='formGroupDetailVisible'
    @hide-dialog='hideLogUserFormDialog'
    @reload='reload'/>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, get, toLower } from 'lodash';
import Column from 'primevue/column';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserGroupEdge, UsersInterface } from '@/apps/admin/model/userGroup';
import { Level, UserGroup } from '@/apps/admin/model/userGroup';
import {
  deleteGroupGraphql,
  getGroupsForConfigGraphql,
  lockGroupGraphql
} from '@/apps/ecm/api/graphql/group-graphql-api';
import FormAddUser from '@/apps/ecm/views/group/FormAddUser.vue';
import FormDecentralization from '@/apps/ecm/views/group/FormDecentralization.vue';
import FormGroupDetail from '@/apps/ecm/views/group/FormGroupDetail.vue';
import GroupForm from '@/apps/ecm/views/group/GroupCreateOrUpdateForm.vue';
import MenuItem from '@/common/components/custom/MenuItem.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, STATUSES } from '@/common/constants';
import { toastErrorData, toastSuccess } from '@/common/helpers/custom-toast-service';
import type { Group } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';

const { t } = useI18n() || {};
const loadingUserGroup = ref();
const userGroups = ref([]);
const totalRecords = ref(0);
const userGroupFormVisible = ref(false);
const userGroupAddFormVisible = ref(false);
const formDecentralizationVisible = ref(false);
const formGroupDetailVisible = ref(false);
const searchKeyword = ref('');
const userGroup = ref<Group>({ status: STATUSES.ACTIVE } as Group);
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'name',
    direction: Direction.ASC
  }]
});
const searchParams = reactive(
  {
    keyword: '',
    pageable: pageable
  }
);
const {
  onResult: getUserGroupResult,
  onError: getUserGroupError,
  refetch: getRefetch
} = getGroupsForConfigGraphql(searchParams);
getUserGroupResult((result) => {
  const {
    totalCount,
    edges
  } = get(result, 'data.getGroupsForConfig', {
    totalCount: 0,
    edges: []
  });
  totalRecords.value = totalCount;
  userGroups.value = edges.map((edge: UserGroupEdge, index: number) => ({
    ...edge.node,
    ordinalNumber: pageable.page * pageable.size + index + 1
  }));
  loadingUserGroup.value = false;
});
getUserGroupError((error) => {
  loadingUserGroup.value = false;
  toastErrorData({
    prefix: 'userGroups.errors',
    error
  });
});

const menuAction = ref();
const menuActions = ref();

function toggleActionMenu({
  event,
  data
}: { event: Event, data: Group }) {
  menuActions.value = [
    {
      label: t('common.edit'),
      icon: 'edit',
      command: () => {
        editUserGroup();
      }
    },
    {
      label: t('common.delete'),
      icon: 'delete',
      command: () => {
        deleteUserGroup();
      }
    },
    {
      label: t('admin.userGroup.add'),
      icon: 'add',
      command: () => {
        addUserGroup();
      }
    },
    {
      label: t('admin.userGroup.decentralization'),
      icon: 'social_leaderboard',
      command: () => {
        decentralization();
      }
    },
    {
      label: t('admin.userGroup.detail'),
      icon: 'info',
      command: () => {
        detail();
      }
    }
  ];

  if (data.status == 'ACTIVE') {
    menuActions.value.push({
      label: t('common.lock'),
      icon: 'lock',
      command: () => {
        lockUserGroup();
      }
    });
  } else if (data.status == 'DEACTIVATE') {
    menuActions.value.push({
      label: t('common.unlock'),
      icon: 'lock_open',
      command: () => {
        lockUserGroup();
      }
    });
  }
  menuAction.value.toggle(event);
  userGroup.value = cloneDeep(data);
}

function reload() {
  assign(userGroup.value, new UserGroup());
  getRefetch(searchParams);
}

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: { page: 0 }
  });
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
        direction: sortOrder === 1 ? 'ASC' : 'DESC'
      }
    ]
  });
  assign(searchParams, pageable);
  reload();
}

function showUserGroupFormDialog() {
  userGroupFormVisible.value = true;
}

function hideLogUserFormDialog() {
  userGroup.value = { status: STATUSES.ACTIVE } as Group;
  userGroupFormVisible.value = false;
  userGroupAddFormVisible.value = false;
  formDecentralizationVisible.value = false;
  formGroupDetailVisible.value = false;
  reload();
}

function editUserGroup() {
  userGroupFormVisible.value = true;
}

function addUserGroup() {
  userGroupAddFormVisible.value = true;
}

function decentralization() {
  formDecentralizationVisible.value = true;
}

function detail() {
  formGroupDetailVisible.value = true;
}

const {
  mutate: deleteUserGroupMutate,
  onDone: deleteUserGroupDone,
  onError: deleteUserGroupError
} = deleteGroupGraphql();

const confirm = useConfirm();

function deleteUserGroup() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.userGroup.userGroupName'),
      itemName: userGroup.value.name
    }),
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteUserGroupMutate({ id: userGroup.value.id });
    }
  });
}

deleteUserGroupDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.userGroup.userGroupName'),
      itemName: userGroup.value.name
    })
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
  onError: lockUserGroupError
} = lockGroupGraphql();

function lockUserGroup() {
  if (userGroup.value.status == 'ACTIVE') {
    confirm.require({
      message: t('common.confirmLock', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        lockUserGroupMutate({ id: userGroup.value.id });
      }
    });
  } else {
    confirm.require({
      message: t('common.confirmUnLock', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      }),
      header: t('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        lockUserGroupMutate({ id: userGroup.value.id });
      }
    });
  }

}

lockUserGroupDone(() => {
  if (userGroup.value.status == 'ACTIVE') {
    toastSuccess({
      message: t('common.result.message.locked', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      })
    });
  } else {
    toastSuccess({
      message: t('common.result.message.unlocked', {
        itemType: t('admin.userGroup.userGroupName'),
        itemName: userGroup.value.name
      })
    });
  }

  confirm.close();
  reload();
});

lockUserGroupError((error) => {
  toastErrorData({ error });
});

function getManageName(users: UsersInterface[]) {
  const filterUser: UsersInterface[] = users.filter(item => {
    return item.level === Level[Level.MANAGE];
  });
  return filterUser.map(item => item.fullName).join(', ');
}
</script>

<script lang='ts'>
export default { name: 'GroupManager' };
</script>

<style scoped>

</style>
