<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header='t("admin.userGroup.addUser")'
    @hide='emits("hide-dialog")'>

    <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
      <InputText
        v-model='searchKeyword'
        class='overflow-auto w-full'
        :placeholder='t("common.search")'
        @keyup.enter='searchDatatable'/>
    </div>
    <DataTable
      v-model:selection='selectedUser'
      data-key='id'
      :row-class='rowClass'
      scroll-height='60vh'
      table-style='min-width: 40rem'
      :total-records='totalRecords'
      :value='listUser'
      @page='onPage($event)'>
      <Column
        header-style='width: 3rem'
        selection-mode='multiple'></Column>
      <Column
        field='fullName'>
        <template #body='{data: {avatar, email, fullName}}'>
          <div class='flex gap-2'>
            <AppAvatar
              v-if='avatar'
              :avatar='urlImage + avatar'/>
            <div
              v-else
              class='align-items-center border-circle flex justify-content-center'
              :style='{ backgroundColor: getAvtColor(fullName).backgroundColor,
                        color: "white",
                        width: "42px",
                        height: "42px"
              }'>
              {{
                fullName ? fullName.split(' ').slice(-1).map((word: string) => word.charAt(0)).join('').toUpperCase() : ''
              }}
            </div>
            <div>
              <div class='font-semibold'>{{ fullName }}</div>
              <p>{{ email }}</p>
            </div>
          </div>
        </template>

      </Column>
    </DataTable>

    <template #footer>
      <div class='flex flex-row gap-2 justify-content-center py-1'>
        <Button
          icon='pi pi-times'
          :label='t("common.close")'
          severity='danger'
          @click='emits("hide-dialog")'/>
        <Button
          icon='pi pi-check'
          :label='t("common.save")'
          @click='addUserInUserGroup'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { assign, cloneDeep, get } from 'lodash';
import { nextTick, onMounted, type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import {
  addUserIntoOrganizationGraphql,
  getOrganizationByIdGraphql
} from '@/apps/admin/api/graphql/organization-graphql-api';
import type { UserEdge } from '@/apps/admin/model/User';
import { Level } from '@/apps/admin/model/userGroup';
import { getGroupById } from '@/apps/ecm/api/graphql/group-graphql-api';
import { addUserToUserGroup } from '@/apps/ecm/api/rest/groupPermission';
import { GATEWAY_URL } from '@/common/api/configService';
import { DEFAULT_DIALOG_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getAvtColor } from '@/common/helpers/utils';
import type { Group, UserLevel } from '@/common/model/group';
import { Direction, type Pageable } from '@/common/model/query';
import type { UserInterface } from '@/common/model/User';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false
  },
  group: {
    type: Object as PropType<Group>,
    default: {} as Group
  }
});

const emits = defineEmits(['hide-dialog', 'reload', 'group-emit']);

const urlImage = GATEWAY_URL + '/files/preview/';

const searchKeyword = ref('');
const visible = ref(props.visibleDialog);
const dataTable = ref(null);
const { t } = useI18n() || {};
const selectedUser = ref<UserInterface[]>([]);
const listUser = ref<UserInterface[]>([]);
const totalRecords = ref(0);
const user = ref<UserInterface[]>([]);
const loadingUser = ref();
const canLoadMore = ref(true);
const isLoadMore = ref(true);
const loadingMore = ref(false);
const userManagers = ref();
const pageable = reactive<Pageable>({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [{
    property: 'server',
    direction: Direction.ASC
  }]
});
const searchParams = reactive(
  {
    keyword: '',
    organization: '',
    pageable: pageable
  }
);
const {
  onResult: getAllUserResult,
  refetch: getRefetch
} = getAllUserNotAdminGraphql(searchParams);

getGroupById(props.group.id).onResult((res) => {
  selectedUser.value = cloneDeep(res.data.getGroupById.users);
  userManagers.value = selectedUser.value.filter((user: any) => user.level == Level[Level.MANAGE]);
});

getAllUserResult((response) => {
  const {
    totalCount,
    edges
  } = get(response, 'data.getAllUserNotAdmin', {
    totalCount: 0,
    edges: []
  });

  totalRecords.value = totalCount;
  if (isLoadMore.value) {
    user.value = [...user.value, ...edges.map((edge: UserEdge) => ({ ...edge.node }))];
  } else {
    user.value = edges.map((edge: UserEdge) => ({ ...edge.node }));
  }
  isLoadMore.value = false;

  canLoadMore.value = edges.length >= DEFAULT_PAGE_SIZE;
  loadingUser.value = false;
  listUser.value = user.value;
});

function addUserInUserGroup() {
  addUserToUserGroup({
    id: props.group.id,
    members: selectedUser.value.map((user: UserInterface) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      level: userManagers.value.find((u: any) => u.id == user.id)?.level ?? Level.MEMBER
    }))
  }).then(() => {
    toastSuccess({ message: 'Đã thêm thành viên vào nhóm thành công.' });
    emits('hide-dialog');
  });
}

watch(() => props.group, (value) => {
  getOrganizationByIdGraphql(value.id).onResult((res: any) => {
    selectedUser.value = res.data.getOrganizationById.users;
  });
});

onMounted(() => {
  nextTick(() => {
    addScrollEventListener('.p-dialog-content');

    if (dataTable.value) {
      addScrollEventListener('.p-datatable-wrapper');
    }
  });
});

async function loadUsers(page: number, size: number) {
  loadingUser.value = true;
  searchParams.pageable.page = page;
}

const rowClass = (data: UserLevel) => {
  return [{ 'p-disabled': userManagers.value?.find((u: any) => u.id == data.id) }];
};

function scrollEvent(event: any) {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = event.target;
  if (scrollTop + clientHeight + 1 >= scrollHeight && !loadingMore.value && canLoadMore.value) {
    isLoadMore.value = true;
    loadingMore.value = true;
    pageable.page += 1;
    loadUsers(pageable.page, pageable.size).then(() => {
      loadingMore.value = false;
    });
  }
}

function addScrollEventListener(selector: string) {
  const scrollableContainer = document.querySelector(selector);
  if (scrollableContainer) {
    scrollableContainer.addEventListener('scroll', scrollEvent);
  }
}

const {
  mutate: addUserToOrganizationMutate,
  onDone: addUserToOrganizationDone,
} = addUserIntoOrganizationGraphql();

// function changeUserLevel(event: DropdownChangeEvent, user: UserInGroupInterface) {
//   selectedUser.value.map((u: UsersInterface) => u.id == user.id ? u.level = event.value : '');
//   user.level = event.value;
// }

function reload() {
  getRefetch(searchParams);
}

function searchDatatable() {
  assign(searchParams, {
    keyword: searchKeyword.value,
    pageable: {
      page: 0,
      size: DEFAULT_PAGE_SIZE
    }
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

addUserToOrganizationDone(() => {
  toastSuccess({ message: t('admin.userGroup.addUser') });
  emits('reload');
  emits('hide-dialog');
});

</script>

<script lang='ts'>
export default { name: 'FormAddUser' };
</script>

<style scoped>
/* Ẩn checkbox "Select All" trong tiêu đề bảng */
:deep(.p-datatable-thead th:first-child .p-checkbox) {
  display: none; /* Ẩn checkbox */
}

/* Tùy chọn: Thu hẹp chiều rộng cột đầu tiên để không để lại khoảng trống */
:deep(.p-datatable-thead th:first-child ) {
  width: 2rem; /* Điều chỉnh kích thước cột nếu cần */
}
</style>