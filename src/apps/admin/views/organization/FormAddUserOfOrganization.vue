<template>
  <Dialog
    v-model:visible='visible'
    :header="t('admin.userGroup.addUser')"
    v-bind='DEFAULT_DIALOG_CONFIG'
    @hide="emits('hide-dialog')">
    <div class='align-items-center flex flex-wrap justify-content-between mb-2'>
      <InputText
        v-model='searchKeyword'
        class='overflow-auto w-full'
        :placeholder="t('common.search')"/>
    </div>
    <DataTable
      ref='dataTable'
      v-model:selection='selectedUser'
      data-key='id'
      scroll-height='60vh'
      style='min-height: 40rem'
      table-style='min-width: 40rem'
      :total-records='totalRecords'
      :value='listUser'>
      <Column
        header-style='width: 3rem'
        selection-mode='multiple'></Column>
      <Column field='fullName'>
        <template #body='{ data: { avatar, email, fullName } }'>
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
                    .split(' ')
                    .slice(-1)
                    .map((word: string) => word.charAt(0))
                    .join('')
                    .toUpperCase()
                  : ''
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
          :label="t('common.close')"
          severity='danger'
          @click="emits('hide-dialog')"/>
        <Button
          icon='pi pi-check'
          :label="t('common.save')"
          @click='addUserInUserGroup'/>
      </div>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { assign, get, throttle } from 'lodash';
import { onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { addUserIntoOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type {
  Organization,
  UserInOrganizationInterface,
} from '@/apps/admin/model/organization';
import type { UserEdge } from '@/apps/admin/model/User';
import { GATEWAY_URL } from '@/common/api/configService';
import { DEFAULT_DIALOG_CONFIG, DEFAULT_PAGE_SIZE } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { getAvtColor } from '@/common/helpers/utils';
import { Direction, type Pageable } from '@/common/model/query';
import type { UserInterface } from '@/common/model/User';

interface organizationFormProps {
  visibleDialog: boolean;
  item: Organization;
}

const props = withDefaults(defineProps<organizationFormProps>(), {
  visibleDialog: false,
  item: undefined,
});

const emits = defineEmits(['hide-dialog', 'reload', 'group-emit']);

const urlImage = GATEWAY_URL + '/files/preview/';

const searchKeyword = ref('');
const visible = ref(props.visibleDialog);
const dataTable = ref(null);
const { t } = useI18n() || {};
const selectedUser = ref<UserInOrganizationInterface[]>([]);
const listUser = ref<UserInterface[]>([]);
const totalRecords = ref(0);
selectedUser.value = props.item.users.map((x) => ({
  id: x.id,
  email: x.email,
  fullName: x.fullName,
  username: x.username,
}));
const pageable = reactive<Pageable>({
  page: 0,
  size: 9999999,
  sort: [
    {
      property: 'username',
      direction: Direction.ASC,
    },
  ],
});
const searchParams = reactive({
  keyword: ''.trim(),
  organization: '',
  pageable: pageable,
});

const {
  onResult: getUserOnResult,
  refetch: getRefetch,
  variables: getUserVariables,
} = getAllUserNotAdminGraphql(searchParams);

const {
  mutate: addUserToOrganizationMutate,
  onDone: addUserToOrganizationDone,
} = addUserIntoOrganizationGraphql();

getUserOnResult((result) => {
  const { loading } = result;
  const {
    totalCount,
    edges
  } = get(result, 'data.getAllUserNotAdmin', {
    totalCount: 0,
    edges: [],
  });
  listUser.value = [
    ...listUser.value,
    ...edges.map((edge: UserEdge) => edge.node),
  ];
  totalRecords.value = totalCount;
});

function addUserInUserGroup() {
  addUserToOrganizationMutate({
    id: props.item.id,
    users: selectedUser.value.map((user: UserInOrganizationInterface) => ({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    })),
  });
}

onMounted(() => {
  addScrollEventListener('.p-datatable-wrapper');
});

function scrollEvent(e: Event) {
  e.target instanceof HTMLElement
  && e.target.scrollHeight - e.target.scrollTop - 100 <= e.target.clientHeight
  && moreUsers();
}

function moreUsers() {
  if (listUser.value.length >= totalRecords.value) {
    return;
  }
  // pageable.page++;
  searchParams.pageable.page++;
  getUserVariables.value = searchParams;
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

function reload() {
  listUser.value = [];
  getRefetch();
}

watch(searchKeyword, () => {
  listUser.value = [];
  assign(searchParams, {
    keyword: searchKeyword.value.trim(),
    pageable: {
      page: 0,
      size: DEFAULT_PAGE_SIZE,
    },
  });
  getUserVariables.value = searchParams;
});

addUserToOrganizationDone(() => {
  toastSuccess({ message: t('admin.userGroup.addUser') });
  emits('reload');
  emits('hide-dialog');
});
</script>

<script lang='ts'>
export default { name: 'FormAddUserOfOrganization' };
</script>

<style scoped></style>
