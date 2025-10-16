<template>
  <div
    v-if='!hideControls'
    class='flex gap-5 justify-content-between pb-2'>
    <div class='flex gap-5'>
      <label class='flex gap-1'>
        <RadioButton
          v-model='option'
          name='source'
          value='all'>
        </RadioButton>
        <p class='font-semibold'>Tất cả</p>
      </label>

      <label class='flex gap-1'>
        <RadioButton
          v-model='option'
          name='source'
          value='user'>
        </RadioButton>
        <p class='font-semibold'>Người dùng</p>
      </label>

      <label class='flex gap-1'>
        <RadioButton
          v-model='option'
          name='source'
          value='group'>
        </RadioButton>
        <p class='font-semibold'>Nhóm</p>
      </label>

      <label class='flex gap-1'>
        <RadioButton
          v-model='option'
          name='source'
          value='role'>
        </RadioButton>
        <p class='font-semibold'>Chức vụ</p>
      </label>
    </div>
    <InputText
      v-model='searchKeyword'
      class='w-20rem'
      :placeholder="t('common.search')"/>
  </div>
  <div
    class='content overflow-auto'
    :style='hideControls ? ($attrs.style as string) : "height: 60vh"'>
    <UserSelectMoreDetail
      v-if='option == "all"'
      v-model='userIds'
      v-model:value-search='searchKeyword'
      class='overflow-auto w-full'
      display-mode='tree'
      :is-hide-search='true'
      :org-type='userDeptRole.type!!'
      selection-mode='checkbox'
      :user-id-only='true'
      :users='users'/>

    <DataTable
      v-if='option == "user"'
      v-model:selection='userIds'
      class='overflow-auto'
      data-key='id'
      selection-mode='multiple'
      :value='usersMoreDetails'>
      <Column
        class='col-1 text-center'
        selection-mode='multiple'/>

      <Column
        class='col-1 text-center'
        header='STT'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        field='userId'
        header='Người nhận'
        header-class='align-content-start'>
        <template #body='{data:{ userId, deptName}}'>
          <AppUserDeptRole
            avatar-size='2.5'
            info-visible
            :infos='["positionName", "deptName", "roleName"]'
            name-visible
            :user-dept-role='{roleId: "", userId: userId,deptId: "", deptName : deptName, userName: "", roleName: "", type: userDeptRole.type}'/>
        </template>
      </Column>

      <Column
        class='col-4'
        header='Vai trò/Tên đăng nhập'>
        <template #body='{data: {roleId, username}}'>
          <div>{{ mapRoleName.get(roleId) || "" }}</div>
          <div>{{ username }}</div>
        </template>
      </Column>
    </DataTable>

    <DataTable
      v-if='option == "dept"'
      v-model:selection='selectedOrganizations'
      class='overflow-auto'
      data-key='id'
      selection-mode='multiple'
      :value='organizations'>
      <Column
        class='text-center'
        selection-mode='multiple'/>

      <Column
        class='text-center'
        header='STT'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        header='Tên phòng ban'>
        <template #body='{data: {deptName}}'>
          {{ deptName }}
        </template>
      </Column>
    </DataTable>

    <DataTable
      v-if='option == "position"'
      v-model:selection='selectedPositions'
      class='overflow-auto'
      data-key='id'
      selection-mode='multiple'
      :value='listPosition'>
      <Column
        class='text-center'
        selection-mode='multiple'/>

      <Column
        class='text-center'
        header='STT'>
        <template #body='{index}'>
          {{ index + 1 }}
        </template>
      </Column>

      <Column
        header='Tên chức vụ'>
        <template #body='{data}'>
          {{ data.name }}
        </template>
      </Column>
    </DataTable>

    <DataTable
      v-if='option == "group"'
      v-model:selection='selectedGroup'
      selection-mode='multiple'
      :value='groups'
      v-bind='DEFAULT_DATATABLE_CONFIG'>
      <template #empty>
        <span class='block font-bold text-600 text-center'>{{
          t("common.emptyRecords", {
            itemType: toLower(t("document.groupReceivingDocuments.objectName")),
          })
        }}</span>
      </template>
      <Column
        class='text-center'
        selection-mode='multiple'/>
      <Column
        class='text-center'
        header='#'
        style='width: 5%'>
        <template #body='slotProps'>
          {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column
        field='code'
        :header="t('document.groupReceivingDocuments.code')"></Column>
      <Column
        field='name'
        :header="t('document.groupReceivingDocuments.name')"></Column>

      <Column
        field='users'
        :header="t('document.groupReceivingDocuments.members')">
        <template #body='{ data: { users } }'>
          <div class='flex justify-content-center'>
            <AppGroupAvatar
              v-if='users'
              avatar-size='2.5'
              :user-ids='users'/>
          </div>
        </template>
      </Column>

      <Column
        class='text-center'
        :exclude-global-filter='true'
        field='status'
        :header="t('common.status')">
        <template #body='{ data: { status } }'>
          <span
            class='status-badge'
            :class="`status-${status ? 'active' : 'deactivate'}`">{{
              status
                ? t(`common.statuses.active`)
                : t("common.statuses.deactivate")
            }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">

import { get, toLower } from 'lodash';
import { storeToRefs } from 'pinia';
import Column from 'primevue/column';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllUserMoreInfoGraphql,
  getAllUserMoreInfoNotCurrentUserGraphql
} from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getAllPositionGraphql } from '@/apps/admin/api/graphql/position/position-graphql';
import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { getAllGroupReceivingDocuments } from '@/apps/document/api/graphql/group-receiving-documents';
import { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import UserSelectMoreDetail from '@/apps/work-flow/views/components/UserSelectMoreDetail/UserSelectMoreDetail.vue';
import AppGroupAvatar from '@/common/components/app/AppGroupAvatar.vue';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { DEFAULT_DATATABLE_CONFIG } from '@/common/constants';

const props = defineProps({
  userDept: {
    type: Array as PropType<any>,
    default: [] as any[]
  },
  hideControls: {
    type: Boolean,
    default: false
  },
  option: {
    type: String,
    default: undefined
  },
  searchKeyword: {
    type: String,
    default: undefined
  }
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { result } = getAllRolesPublic();
const mapRoleName = computed(() => {
  return new Map<string, string>(result?.value?.rolesPublic?.map((role: {
    code: string,
    name: string
  }) => [role.code, role.name]));
});
const organizations = ref([]);
const organizationsTemp = ref([]);

const { onResult: getAllOrganizationResult, } = getAllOrganizationPublicGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.allOrganizationPublic', []).map((res: any) => ({
    deptId: res.id,
    deptName: res.name,
    id: `org_${res.id}`
  }));

  organizationsTemp.value = organizations.value;
});

const userIds = defineModel<any>({ default: [] });
const { t } = useI18n();
const option = computed({
  get: () => props.option || localOption.value,
  set: (value) => {
    localOption.value = value;
  }
});
const localOption = ref<string>('all');
const searchKeyword = computed({
  get: () => props.searchKeyword || localSearchKeyword.value,
  set: (value) => {
    localSearchKeyword.value = value;
  }
});
const localSearchKeyword = ref<string>();
const selectedUser = ref();
const selectedOrganizations = ref();
const selectedGroup = defineModel<any>('selectGroup', { default: [] });
const selectedPositions = defineModel<any>('selectPositions', { default: [] });
const users = ref<UserMoreInfo[]>();
const groups = ref([]);
const groupsTemp = ref([]);
const usersMoreDetails = ref<UserMoreInfo[]>();
const usersMoreDetailsTemp = ref<UserMoreInfo[]>();
const listPosition = ref();

watch(searchKeyword, (value) => {
  if (option.value == 'user') {
    usersMoreDetails.value = usersMoreDetailsTemp.value;
    usersMoreDetails.value = usersMoreDetails.value?.filter((x: any) => x.deptId && (x.userName.toLowerCase().includes(value?.trim().toLowerCase())
        || x.userName.toLowerCase().includes(value?.trim().toLowerCase())
        || x.email.toLowerCase().includes(value?.trim().toLowerCase())
        || x.phone.toLowerCase().includes(value?.trim().toLowerCase())));
  } else if (option.value == 'dept') {
    organizations.value = organizationsTemp.value;
    organizations.value = organizations.value.filter((x: any) => x.deptName.toLowerCase().includes(value?.trim().toLowerCase()));
  } else if (option.value == 'group') {
    groups.value = groupsTemp.value;
    groups.value = groups.value.filter((x: any) => x.name.toLowerCase().includes(value?.trim().toLowerCase()));
  }
});

const { onResult: getAllPositionResult } = getAllPositionGraphql();
getAllPositionResult((res) => {
  listPosition.value = get(res, 'data.allPosition', []);
});

getAllGroupReceivingDocuments({ keyword: null }).onResult((res) => {
  groups.value = res.data.getAllGroupReceivingDocuments;
  groupsTemp.value = res.data.getAllGroupReceivingDocuments;
});

getAllUserMoreInfoNotCurrentUserGraphql().onResult((res) => {
  users.value = res.data.getAllUserMoreInfoNotCurrentUser.map((res: UserMoreInfo) => ({
    ...res,
    roles: res.roles?.filter((role: any) => Object.values(RoleType).includes(role))
  }));

  const usersMoreInfo: any[] = [];
  res.data.getAllUserMoreInfoNotCurrentUser.forEach((user: any) => {
    user.roles?.forEach((role: string) => {
      if (Object.values(RoleType).includes(role as RoleType) && role != RoleType.VAN_THU && role != RoleType.THU_KY) {
        usersMoreInfo.push({
          userId: user.id,
          userName: user.fullName,
          username: user.username,
          deptId: user.departments.length > 0 ? user.departments[0]?.id : '',
          deptName: user.departments.length > 0 ? user.departments[0]?.name : '',
          roleId: role,
          roleName: mapRoleName.value.get(role) || '',
          id: `${user.id}_${role}`,
          phone: user.phone,
          email: user.email
        });
      }
    });
  });
  usersMoreDetails.value = usersMoreInfo;
  usersMoreDetailsTemp.value = usersMoreInfo;
});

onMounted(() => {
  if (props.userDept) {
    props.userDept.forEach((ud: any) => {
      if (ud.value.objectType == ReceiveObjectType.NGUOI_NHAN_TRONG_HE_THONG) {
        selectedUser.value = [...selectedUser.value || [], ...[{
          userId: ud.value.objectId,
          userName: ud.value.objectName,
          deptId: ud.value.deptId,
          deptName: ud.value.deptName,
          roleId: ud.value.roleId,
          roleName: ud.value.roleName,
          id: `${ud.value.objectId}_${ud.value.roleId}`
        }]];
      } else if (ud.value.objectType == ReceiveObjectType.DON_VI_NOI_BO) {
        selectedOrganizations.value = [...selectedOrganizations.value || [], ...[{
          deptId: ud.value.objectId,
          deptName: ud.value.objectName,
          id: `org_${ud.value.objectId}`
        }]];
      }
    });

    userIds.value = [...selectedUser.value || [], ...selectedOrganizations.value || []];
  }
});

watch(option, () => {
  searchKeyword.value = '';
  usersMoreDetails.value = usersMoreDetailsTemp.value;
  organizations.value = organizationsTemp.value;
});

</script>

<style scoped>

</style>

<script lang="ts">
export default { name: 'UserOrganization' };
</script>