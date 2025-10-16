<template>
  <Toolbar class='h-3rem mb-2 px-2 py-0 surface-0'>
    <template #start>
      <div class='align-items-center flex gap-2'>
        <ButtonIcon
          v-tooltip='"Hiển thị cơ cấu"'
          class='align-self-center focus:shadow-none font-normal hover:surface-200 p-1'
          icon='menu'
          rounded
          text
          @click='showFilterFn()'/>
        <div class='font-bold'>
          {{ t('admin.user.tableTitle') }}
        </div>
      </div>
    </template>
    <template #end>
      <div class='btn-group-toolbar flex gap-1 mr-1 my-1'>
        <Button
          v-if="hasPermission('/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/CREATE')"
          class='btn-create focus:shadow-none font-medium p-2'
          icon='pi pi-plus'
          :label='t("common.create")'
          @click='showUserFormDialog'/>

        <ButtonGroup class='border-1 border-400 border-round-sm'>
          <Button
            v-tooltip.top="t('admin.user.table')"
            class='focus:shadow-none font-normal hover:surface-200'
            :class="showTable ? 'p-button-outlined bg-primary-500 text-0' : ''"
            icon='pi pi-bars'
            @click='showTableFn(true)'/>
          <Button
            v-tooltip.top="t('admin.user.grid')"
            class='focus:shadow-none font-normal hover:surface-200'
            :class="!showTable ? 'p-button-outlined bg-primary-500 text-0' : ''"
            icon='pi pi-th-large'
            @click='showTableFn(false)'/>
        </ButtonGroup>

        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-import'
          label='Import'
          severity='secondary'
          @click='importExcel'></Button>

        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-file-export'
          label='Export'
          severity='secondary'
          @click='exportExcel'></Button>

        <Button
          class='focus:shadow-none font-normal hover:surface-200'
          icon='pi pi-sync'
          label='Reload'
          severity='secondary'
          @click='refetchData()'></Button>

      </div>
    </template>
  </Toolbar>

  <div
    class='flex gap-3 h-full'
    style='height: calc(100vh - 10rem)'>
    <transition name='fade-slide'>
      <div
        v-if='showFilter'
        class='show-tree'>
        <Tree
          v-model:selectionKeys='selectedOrganization'
          class='h-full overflow-auto'
          :expanded-keys='expandKey'
          selection-mode='single'
          :style='`max-height: ${viewHeight}`'
          :value='organizations'>
          <template #default='slotProps'>
            <div
              class='flex justify-content-between'
              :class="
                (slotProps.node.parentId == '' || slotProps.node.parentId == null || slotProps.node.type === 'DV'
                  ? 'font-bold'
                  : '') +
                  ' ' +
                  (slotProps.node.status == 'DEACTIVATE' ? 'text-red-500' : '')
              ">
              <div>{{ slotProps.node.label }}</div>
              <div class='text-right'>{{ slotProps.node.countUser }}</div>
            </div>
          </template>
        </Tree>
      </div>
    </transition>

    <transition
      mode='out-in'
      name='fade-slide'>
      <div
        v-if='true'
        key='user-manager-content'
        class='w-full'>
        <DataTable
          v-if='showTable'
          v-model:selection='selectedRow'
          class='border-1 border-300 border-round-sm h-full surface-0'
          :loading='loadingUser'
          row-hover
          :style="{ 'max-height': viewHeight }"
          v-bind="{
            ...DEFAULT_DATATABLE_CONFIG,
            'scroll-height': 'calc(100vh - 9.3rem)',
          }"
          :total-records='totalRecords'
          :value='users'
          @sort='onSort($event)'
          @virtual-scroll='getUserFetchMore'>
          <template #empty>
            <span class='block font-bold text-600 text-center'>{{
              t('common.emptyRecords', {
                itemType: toLower(t('admin.user.objectName')),
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

          <Column :header="t('admin.user.username')">
            <template #body='{ data: { avatar, fullName, username, locked } }'>
              <div class='flex gap-2'>
                <AppAvatar
                  v-if='avatar'
                  :avatar='urlImage + avatar'/>
                <div
                  v-else
                  class='align-items-center border-circle flex justify-content-center'
                  :style="{
                    backgroundColor: getAvtColor(fullName).backgroundColor,
                    color: 'white',
                    width: '42px',
                    height: '42px',
                  }">
                  {{
                    fullName
                      ? fullName
                        ?.split(' ')
                        .slice(-1)
                        .map((word: string) => word.charAt(0))
                        .join('')
                        .toUpperCase()
                      : ''
                  }}
                </div>
                <div>
                  <div
                    class='font-semibold'
                    :class="{
                      'is-deactivate': locked
                    }">{{ fullName }}
                  </div>
                  <p>{{ username }}</p>
                </div>
              </div>
            </template>
          </Column>

          <Column :header="t('admin.user.positionOrganization')">
            <template #body='{ data: { positionName, roles, organizationName } }'>
              <div class='flex gap-3'>
                <div
                  v-if='roles?.includes(RoleType.LANH_DAO)'
                  class='align-content-center'>
                  <AppIcon
                    name='supervisor_account'
                    size='1.5'/>
                </div>
                <div class='flex flex-column gap-2'>
                  <div>{{ positionName?.join(', ') }}</div>
                  <div>{{ organizationName?.join(', ') }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column :header="t('admin.user.mobileEmail')">
            <template #body='{ data: { phone, email } }'>
              <div class='flex'>
                <div>
                  <div>{{ phone }}</div>
                  <p>{{ email }}</p>
                </div>
              </div>
            </template>
          </Column>

          <Column :header="t('admin.user.birthDayCreateDate')">
            <template #body='{ data: { birthDay, createDate } }'>
              <div class='text-center'>
                <div>
                  {{ birthDay ? moment(birthDay).format('DD/MM/YYYY') : '' }}
                </div>
                <div>
                  {{
                    createDate
                      ? moment(createDate).format('HH:mm DD/MM/YYYY')
                      : ''
                  }}
                </div>
                <div></div>
              </div>
            </template>
          </Column>

          <Column
            class='text-center'
            field='locked'
            :header="t('admin.user.status')">
            <template #body='{ data: { locked } }'>
              <span
                class='status-badge'
                :class="`status-${locked == false ? 'active' : 'deactivate'}`">{{
                  t(
                    `common.statuses.${locked == false ? 'active' : 'deactivate'}`,
                  )
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
                @click='toggleActionMenu({ event: $event, data: data })'/>
            </template>
          </Column>

          <template #loading>
            <div class='p-5'>
              <ProgressSpinner
                animation-duration='.5s'
                fill='var(--surface-ground)'
                stroke-width='8'
                style='width: 50px; height: 50px'/>
            </div>
          </template>
        </DataTable>

        <div
          v-if='!showTable'
          class='data-view-scroll'
          style='height: 56rem'>
          <DataView
            data-key='id'
            layout='grid'
            :value='users'>
            <template #grid='slotProps'>
              <div class='grid p-3'>
                <div
                  v-if='loadingUser'
                  class='flex flex-wrap gap-3 w-full'>
                  <Skeleton
                    v-for='i in 6'
                    :key='i'
                    border-radius='12px'
                    height='120px'
                    width='100%'/>
                </div>
                <div
                  v-else
                  class='grid p-3 w-full'>
                  <div
                    v-for='(item, index) in slotProps.items'
                    :key='index'
                    class='col-3 xl:col-2'>
                    <div
                      class='align-items-center border-round card-item card-item-bgc-hover flex flex-column p-3 relative'>
                      <div class='avatar'>
                        <AppAvatar
                          v-if='item?.avatar'
                          :avatar='urlImage + item?.avatar'
                          size='7'/>
                        <div
                          v-else
                          class='avatar-placeholder'
                          :style="{
                            backgroundColor: getAvtColor(item?.fullName)
                              .backgroundColor,
                            color: 'white',
                          }">
                          {{
                            item?.fullName
                              ? item?.fullName
                                .split(' ')
                                .slice(-1)
                                .map((word: string) => word.charAt(0))
                                .join('')
                                .toUpperCase()
                              : ''
                          }}
                        </div>
                      </div>
                      <span
                        class='font-bold my-2 text-xl'>{{
                        item?.fullName
                      }}</span>
                      <span class='text-base'>{{ item?.username }}</span>
                      <span class='font-semibold text-lg'>{{ item?.positionName?.join(', ') }}</span>
                      <span class='text-base'>{{ item?.organization }}</span>
                      <span
                        class='mt-2 status-badge'
                        :class="`status-${item?.locked == false ? 'active' : 'deactivate'}`">{{
                          t(
                            `common.statuses.${item?.locked == false ? 'active' : 'deactivate'}`,
                          )
                        }}</span>
                      <ButtonIcon
                        v-tooltip.top="t('common.action')"
                        class='card-btn-more text-color'
                        icon='more_vert'
                        icon-size='1.7'
                        rounded
                        text
                        @click='toggleActionMenu({ event: $event, data: item })'/>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </DataView>
        </div>
      </div>
    </transition>
  </div>

  <Menu
    ref='menuAction'
    :model='menuActionsFilter'
    :popup='true'>
  </Menu>

  <UserForm
    v-if='userFormVisible'
    :is-detail='isDetail'
    :item='selectedUser'
    :visible-dialog='userFormVisible'
    @hide-dialog='hideUserFormDialog'
    @reload='reload'/>

  <ChangePasswordDialog
    v-if='dialogChangePassword'
    :item='selectedUser'
    :visible-dialog='dialogChangePassword'
    @hide-dialog='hideUserFormDialog'/>

  <SelectSupportDialog
    v-if='supportFormVisible'
    :id='selectedUser.id'
    :dept-id='selectedUser.organizationId'
    :org-type='OrganizationType.ADMINISTRATIVE'
    :user='selectedUser'
    :visible-dialog='supportFormVisible'
    @hide-dialog='hideSupportFormDialog'
    @reload='reload'/>

  <DataPermissionDialog
    v-if='visibleDecentralization'
    :id='selectedUser.id'
    :user='selectedUser'
    :visible-dialog='visibleDecentralization'
    @hide-dialog-permission='visibleDecentralization = false'/>
</template>

<script lang='ts' setup>
import { assign, cloneDeep, filter, get, lowerCase, throttle, toLower, } from 'lodash';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import type { DataTableSortEvent } from 'primevue/datatable';
import { useConfirm } from 'primevue/useconfirm';
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  deleteUserGraphql,
  getUserByOrg,
  lockOrUnlockGraphql,
  resetPasswordGraphql,
} from '@/apps/admin/api/graphql/admin-customer-tenant';
import { allOrganizationCountSubOrgPublic } from '@/apps/admin/api/graphql/organization-graphql-api';
import { downloadTemplate } from '@/apps/admin/api/rest/userApi';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { UserEdge, UserInterface } from '@/apps/admin/model/User';
import { hasPermission } from '@/apps/admin/services/permission';
import ChangePasswordDialog from '@/apps/admin/views/user/ChangePasswordDialog.vue';
import DataPermissionDialog from '@/apps/admin/views/user/DataPermissionDialog.vue';
import UserForm from '@/apps/admin/views/user/UserForm.vue';
import { OrganizationType } from '@/apps/document/model/organization';
import { RoleType } from '@/apps/document/model/permission';
import { GATEWAY_URL } from '@/common/api/configService';
import AppAvatar from '@/common/components/app/AppAvatar.vue';
import AppIcon from '@/common/components/app/AppIcon.vue';
import SelectSupportDialog from '@/common/components/dialog/SelectSupportDialog.vue';
import { DEFAULT_DATATABLE_CONFIG, DEFAULT_PAGE_SIZE, } from '@/common/constants';
import { toastErrorData, toastSuccess, toastWarn, } from '@/common/helpers/custom-toast-service';
import { downloadFile } from '@/common/helpers/file-utils';
import { getAvtColor, listToTree } from '@/common/helpers/utils';
import { type Pageable } from '@/common/model/query';
import { useUserStore } from '@/common/store/user';

const { t } = useI18n() || {};
const { user } = storeToRefs(useUserStore());
const searchTerm = inject('searchTerm', ref(''));
const searchTermUpdate = inject('updateSearchTerm', (value: string) => void {});
const selectedUser = ref<UserInterface>({ locked: false } as UserInterface);

const userFormVisible = ref(false);
const supportFormVisible = ref(false);
const showTable = ref(true);
const isDetail = ref(false);
const dataTable = ref(null);
const selectedRow = ref();
const selectedOrganization = ref();
const organizations = ref([]);
const expandKey = ref({});

const menuUtils = ref();
const items = ref([
  {
    label: t('common.downloadTemplate'),
    icon: 'download',
    command() {
      downloadTemplate().then((value) => {
        if (value) {
          const blob = new Blob([value]);
          downloadFile(blob, 'DanhMuc.xlsx');
        }
      });
    }
  },
  {
    label: t('common.import'),
    icon: 'publish'
  },
  {
    label: t('common.export'),
    icon: 'system_update_alt'
  }
]);
const toggle = (event: Event) => {
  menuUtils.value.toggle(event);
};

const viewHeight = ref(calculateHeight());
window.onresize = () => viewHeight.value = calculateHeight();

function calculateHeight() {
  const height = window.innerHeight - 120;
  return `${height}px`;
}

const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE
});
const searchParams = reactive({
  keyword: '',
  organization: '',
  pageable: pageable,
});
const totalRecords = ref(0);
const users = ref<any[]>([]);
const loadingUser = ref(true);
const dialogChangePassword = ref(false);
const showFilter = ref(true);
const urlImage = GATEWAY_URL + '/files/preview/';
const visibleDecentralization = ref(false);

const {
  onResult: getUserOnResult,
  onError: getUserError,
  refetch: getRefetch,
  variables: getUserVariables,
  fetchMore: getUserFetchMore,
} = getUserByOrg(searchParams);

const {
  onResult: getAllOrganizationResult,
  refetch: getOrganizationRefetch
} = allOrganizationCountSubOrgPublic();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationCountSubOrgPublic', []);
  expandKey.value = createCodeObject(organizations.value);
  organizations.value = listToTree(
    organizations.value.map((organization: OrganizationInterface) => ({
      key: organization.code,
      label: organization.name,
      data: organization.code,
      countUser: organization.totalUsers,
      parentId: organization.parentCode,
      type: organization.type,
      children: [],
    })),
    {
      id: 'key',
      parentId: 'parentId',
      children: 'children',
    },
  );
});

getUserOnResult((result) => {
  const { loading } = result;
  const {
    totalCount,
    edges
  } = get(result, 'data.getUserByOrg', {
    totalCount: 0,
    edges: [],
  });
  users.value = [...users.value, ...edges.map((edge: UserEdge) => edge.node)];
  totalRecords.value = totalCount;
  setTimeout(() => {
    loadingUser.value = loading;
  }, 500);
});

function createCodeObject(objects: any[]): { [key: string]: boolean } {
  return objects.reduce(
    (acc, obj) => {
      acc[obj.code] = true;
      return acc;
    },
      {} as { [key: string]: boolean },
  );
}

watch(selectedOrganization, (newValue) => {
  users.value = [];
  pageable.page = 0;
  searchParams.organization = Object.keys(newValue).toString();
  getUserVariables.value = searchParams;
  // Only reload user data, not the entire tree
  loadingUser.value = true;
  getRefetch();
  loadingUser.value = false;
});

watch(searchTerm, (newValue) => {
  users.value = [];
  searchParams.keyword = newValue;
  searchParams.pageable.page = 0;
  getUserVariables.value = searchParams;
});

function scrollEvent(e: Event) {
  e.target instanceof HTMLElement
  && e.target.scrollHeight - e.target.scrollTop - 100 <= e.target.clientHeight
  && moreUsers();
}

function moreUsers() {
  if (users.value.length >= totalRecords.value) {
    return;
  }
  searchParams.pageable.page++;
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener(
      'scrollend',
      throttle(scrollEvent, 2000),
    );
  }
}

watch(showTable, (newValue) => {
  reload();
  nextTick(() => {
    if (newValue && dataTable.value) {
      addScrollEventListener('.p-datatable-wrapper');
    } else {
      addScrollEventListener('.data-view-scroll');
    }
  });
});

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

getUserError((error) => {
  loadingUser.value = false;
  toastErrorData({
    prefix: 'getUserByOrg.errors',
    error,
  });
});

function showTableFn(status: boolean) {
  if (showTable.value != status) {
    users.value = [];
    loadingUser.value = true;
    searchParams.pageable.page = 0;
    getUserVariables.value = searchParams;
  }
  showTable.value = status;
}

const menuAction = ref();

const menuActions = [
  {
    key: 'detail',
    label: t('common.detail'),
    icon: 'pi pi-eye',
    command: () => {
      isDetail.value = true;
      updateUser();
    },
    functionPermission: '',
  },
  {
    key: 'edit',
    label: t('common.edit'),
    icon: 'pi pi-pencil',
    command: () => {
      isDetail.value = false;
      updateUser();
    },
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/UPDATE',
  },
  {
    key: 'decentralization',
    label: t('common.decentralization'),
    icon: 'pi pi-shield',
    command: () => {
      visibleDecentralization.value = true;
    },
    functionPermission: '',
  },
  {
    key: 'lock',
    label: t('common.lock'),
    icon: 'pi pi-lock',
    command: () => {
      lockOrUnlock();
    },
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/LOCK',
  },
  {
    key: 'unlock',
    label: t('common.unlock'),
    icon: 'pi pi-unlock',
    command: () => {
      lockOrUnlock();
    },
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/LOCK',
  },
  {
    key: 'reset-password',
    label: t('admin.user.resetPassword'),
    icon: 'pi pi-sync',
    command: () => {
      resetPassword();
    },
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/RESET',
  },
  {
    key: 'change-password',
    label: t('admin.user.changePassword'),
    icon: 'pi pi-arrow-right-arrow-left',
    command: () => {
      changePassword();
    },
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/CHANGE',
  },
  {
    key: 'delete',
    label: t('common.delete'),
    icon: 'pi pi-trash',
    command: () => {
      deleteUser();
    },
    functionPermission: '/ADMIN/ADMIN_CONFIG/ADMIN_CONFIG-USER/DELETE',
  },
];

let menuActionsFilter = ref();

function toggleActionMenu({
  event,
  data
}: { event: Event; data: any }) {
  selectedUser.value = cloneDeep(data);
  menuActionsFilter.value = filter(menuActions, (action) => {
    return action.key !== (data.locked ? 'lock' : 'unlock');
  })
    .filter((action) => hasPermission(action.functionPermission))
    .filter((action) => {
      if (user.value.id === selectedUser.value.id) {
        return ['edit', 'change-password', 'reset-password', 'decentralization', 'detail'].includes(
          action.key,
        );
      } else {
        return true;
      }
    });
  if (data.roles.includes(RoleType.LANH_DAO)) {
    menuActionsFilter.value = [
      ...menuActionsFilter.value.slice(0, -1),
      {
        key: 'support',
        label: t('common.support'),
        icon: 'pi pi-user',
        command: () => supportFormVisible.value = true,
      },
      ...menuActionsFilter.value.slice(-1),
    ];

  }
  menuAction.value.toggle(event);
  selectedRow.value = data;
}

function reload() {
  pageable.page = 0;
  loadingUser.value = true;
  assign(user.value, {} as UserInterface);
  getUserVariables.value = searchParams;
  getRefetch();
  getOrganizationRefetch();
  loadingUser.value = false;
}

function showFilterFn() {
  users.value = [];
  showFilter.value = !showFilter.value;
  loadingUser.value = true;
  searchParams.organization = '';
  searchParams.keyword = '';
  selectedOrganization.value = '';
  getRefetch();
}

function hideUserFormDialog() {
  userFormVisible.value = false;
  dialogChangePassword.value = false;
  visibleDecentralization.value = false;
  loadingUser.value = true;
  users.value = [];
  selectedUser.value = {} as UserInterface;
  searchTermUpdate('');
  assign(user.value, {} as UserInterface);
  getRefetch();
}

function hideSupportFormDialog() {
  selectedUser.value = {} as UserInterface;
  supportFormVisible.value = false;
  dialogChangePassword.value = false;
  visibleDecentralization.value = false;
  loadingUser.value = true;
  pageable.page = 0;
  searchTermUpdate('');
  // Only reload user data, not the entire tree
  pageable.page = 0;
  loadingUser.value = true;
  assign(user.value, {} as UserInterface);
  getUserVariables.value = searchParams;
  getRefetch();
  loadingUser.value = false;
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
  reload();
}

function showUserFormDialog() {
  selectedUser.value = {} as UserInterface;
  userFormVisible.value = true;
  isDetail.value = false;
}

function updateUser() {
  userFormVisible.value = true;
}

function refetchData() {
  users.value = [];
  loadingUser.value = true;
  getRefetch();
}

const {
  mutate: deleteUserMutate,
  onDone: deleteUserDone,
  onError: deleteUserError,
} = deleteUserGraphql();
const confirm = useConfirm();

function deleteUser() {
  confirm.require({
    message: t('common.confirmDelete', {
      itemType: t('admin.user.userName'),
      itemName: selectedUser.value.fullName,
    }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('common.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteUserMutate({ id: selectedUser.value.id });
    },
  });
}

deleteUserDone(() => {
  toastSuccess({
    message: t('common.result.message.deleted', {
      itemType: t('admin.user.userName'),
      itemName: selectedUser.value.fullName,
    }),
  });
  confirm.close();
  reload();
});

deleteUserError((error) => {
  toastErrorData({ error });
});

const {
  mutate: lockOrUnlockMutate,
  onDone: lockOrUnlockDone,
  onError: lockOrUnlockError,
} = lockOrUnlockGraphql();

function lockOrUnlock() {
  confirm.require({
    message: t(
      `common.${selectedUser.value.locked ? 'confirmUnlock' : 'confirmLock'}`,
      {
        itemType: lowerCase(t('admin.user.objectName')),
        itemName: selectedUser.value.fullName,
      },
    ),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      lockOrUnlockMutate({ id: selectedUser.value.id });
    },
  });
}

lockOrUnlockDone(() => {
  if (!selectedUser.value.locked) {
    toastSuccess({ message: t('admin.user.message.lockSuccess') });
  } else {
    toastSuccess({ message: t('admin.user.message.unlockSuccess') });
  }
  confirm.close();
  reload();
});

lockOrUnlockError((error) => {
  toastErrorData({ error });
});

const {
  mutate: resetPasswordMutate,
  onDone: resetPasswordDone,
  onError: resetPasswordError,
} = resetPasswordGraphql();

function resetPassword() {
  confirm.require({
    message: t('common.confirmResetPassword', { itemName: selectedUser.value.fullName, }),
    header: t('common.confirm'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      resetPasswordMutate({ id: selectedUser.value.id });
    },
  });
}

function changePassword() {
  dialogChangePassword.value = true;
}

resetPasswordDone(() => {
  toastSuccess({ message: t('common.result.message.resetPassword', { itemName: selectedUser.value.fullName, }), });
  confirm.close();
});

resetPasswordError((error) => {
  toastErrorData({ error });
});
const importExcel = () => {
  toastWarn({ message: 'Chức năng sắp ra mắt' });
};
const exportExcel = () => {
  toastWarn({ message: 'Chức năng sắp ra mắt' });
};
</script>

<script lang='ts'>
export default { name: 'UserManager' };
</script>

<style scoped>
label {
  font-weight: bold;
}

.avatar {
  display: inline-block;
  margin-top: 25px;
}

.avatar-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  color: white;
  font-size: 35px;
}

.data-view-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  height: 80vh;
}

:deep(.p-treenode-label) {
  width: 100%;
}

:deep(.p-tree-selectable) {
  height: 80vh;
}

:deep(.p-tree-selectable:hover) {
  overflow: auto;
}

:deep(.btn-create) {
  .p-button:hover {
    background-color: #2c5099 !important;
  }
}

.card-item {
  border: 1px solid #d9d9d9;
  padding: 10px;
  height: 290px;

  .card-btn-more {
    visibility: hidden;
  }
}

.show-tree {
  width: 35rem;
}

@media screen and (min-width: 1200px) {
  .show-tree {
    width: 35rem;
  }
}

.card-item:hover {
  .card-btn-more {
    visibility: visible;
    position: absolute;
    top: 10px;
    right: 10px;
  }
}

:deep(.p-treenode) {
  padding: 0
}

.is-deactivate {
  color: var(--text-red) !important;
}
</style>
