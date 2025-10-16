<template>
  <Dialog
    v-bind='DEFAULT_DIALOG_CONFIG'
    v-model:visible='visible'
    :header="
      t('document.partyPosition.addUserToOrganization') +
        ` ${props.organizationName} (${totalRecords})`
    "
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
      data-key='userId'
      scroll-height='60vh'
      style='min-height: 40rem'
      table-style='min-width: 40rem'
      :total-records='totalRecords'
      :value='listUser'>
      <Column
        header-style='width: 3rem'
        selection-mode='multiple'></Column>
      <Column
        field='fullName'
        :header="t('document.partyPosition.userName')">
        <template #body='{ data: { userId } }'>
          <AppUser
            avatar-size='2.5'
            info-visible
            :infos="['email']"
            name-visible
            :user-id='userId'/>
        </template>
      </Column>

      <Column
        body-class='text-center'
        field='position'
        :header="t('document.partyPosition.position')">
        <template #body='{ data, field }'>
          <Dropdown
            v-model='data[field]'
            option-label='label'
            option-value='value'
            :options='positions'
            :placeholder="t('document.partyPosition.choosePosition')"/>
        </template>
      </Column>

      <Column
        body-class='text-center'
        field='role'
        :header="t('document.partyPosition.role')">
        <template #body='{ data, field }'>
          <Dropdown
            v-model='data[field]'
            option-label='label'
            option-value='value'
            :options='roles'
            :placeholder="t('document.partyPosition.chooseRole')"/>
        </template>
      </Column>

      <Column
        body-class='text-center'
        field='isConcurrently'
        :header="t('document.partyPosition.concurrently')">
        <template #body='{ data, field }'>
          <InputSwitch v-model='data[field]'/>
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
          :disabled='selectedUser.length == 0'
          icon='pi pi-check'
          :label="t('common.save')"
          @click='addUserInUserGroup'/>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { get } from 'lodash';
import { type PropType, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserNotAdminGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { addUserIntoOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getRoles } from '@/apps/admin/api/graphql/role-graphql-api';
import type { UserEdge } from '@/apps/admin/model/User';
import { getAllPartyPosition } from '@/apps/document/api/graphql/party-position';
import { saveUserOrganizationGraphql } from '@/apps/document/api/graphql/userOrganization';
import { type UserInOrganizationInterface } from '@/apps/document/model/organization';
import AppUser from '@/common/components/app/AppUser.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { Direction, type Pageable } from '@/common/model/query';

const props = defineProps({
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  organizationName: {
    type: String,
    default: null,
  },
  organizationId: {
    type: String,
    default: null,
  },
  selectedUsers: {
    type: Array as PropType<UserInOrganizationInterface[]>,
    default: [] as UserInOrganizationInterface[],
  },
});

const emits = defineEmits(['hide-dialog', 'reload', 'group-emit']);
const {
  mutate: saveMutation,
  onDone: saveOnDone
} =
    saveUserOrganizationGraphql();

const listFullUser = ref<any[]>([]);
const searchKeyword = ref('');
const visible = ref(props.visibleDialog);
const dataTable = ref(null);
const { t } = useI18n() || {};
const selectedUser = ref<UserInOrganizationInterface[]>(props.selectedUsers);
const listUser = ref<any[]>([]);
const positions = ref();
const roles = ref();
const { onResult: getPositionResult } = getAllPartyPosition();
const { onResult: getRoleResult } = getRoles({
  keyword: '',
  pageable: {
    page: 0,
    size: 999999,
  },
});

getRoleResult((res) => {
  roles.value = res.data.getRoles.edges.map((r: any) => ({
    label: r.node.name,
    value: r.node.code,
  }));
});

getPositionResult((res) => {
  positions.value = res.data.getAllPartyPosition.map((c: any) => ({
    label: c.name,
    value: c.code,
  }));
});

const totalRecords = ref(0);
const pageable = reactive<Pageable>({
  page: 0,
  size: 999999999,
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
  const {
    totalCount,
    edges
  } = get(result, 'data.getAllUserNotAdmin', {
    totalCount: 0,
    edges: [],
  });
  listFullUser.value = [
    ...listFullUser.value,
    ...edges.map((edge: UserEdge) => edge.node),
  ].map((x: UserInOrganizationInterface) => ({
    userId: x.id,
    position: '',
    role: '',
    isConcurrently: false,
    username: x.username,
    phone: x.phone,
    email: x.email,
    birthDay: x.birthDay,
    createdDateOfUser: x.createDate,
    fullName: x.fullName,
  }));

  listUser.value = listFullUser.value;
  totalRecords.value = totalCount;

  selectedUser.value.forEach((su) => {
    const user = listFullUser.value.find((lu) => lu.userId == su.userId);
    user.isConcurrently = su.isConcurrently;
    user.position = su.position;
    user.role = su.role;
  });
});

function addUserInUserGroup() {
  saveMutation({
    userOrganizationInputs: selectedUser.value.map(
      (user: UserInOrganizationInterface) => {
        const userInList = listFullUser.value.find(
          (x) => x.userId === user.userId,
        );
        return {
          organizationId: props.organizationId,
          userId: user.userId,
          position: userInList?.position,
          role: userInList?.role,
          createdDateOfUser: user.createdDateOfUser,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          gender: user.gender,
          birthDay: user.birthDay,
          isConcurrently: userInList?.isConcurrently,
        };
      },
    ),
  });
}

watch(searchKeyword, (value) => {
  if (value != null && value != '') {
    listUser.value = listFullUser.value.filter((item) =>
      item.fullName.toLowerCase().includes(searchKeyword.value.toLowerCase()),
    );
  } else {
    listUser.value = listFullUser.value;
  }

  // assign(searchParams, {
  //   keyword: searchKeyword.value.trim(),
  //   pageable: {
  //     page: 0,
  //     size: 999999999
  //   }
  // });
  // getUserVariables.value = searchParams;
});
addUserToOrganizationDone(() => {
  toastSuccess({ message: t('admin.userGroup.addUser') });
  emits('reload');
  emits('hide-dialog');
});

saveOnDone(() => {
  toastSuccess({ message: t('document.partyPosition.message.addUserSuccess') });
  emits('hide-dialog');
});
</script>

<script lang='ts'>
export default { name: 'FormAddUserToOrganization' };
</script>

<style scoped></style>
