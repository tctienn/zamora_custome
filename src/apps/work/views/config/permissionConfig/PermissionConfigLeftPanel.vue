<template>
  <div class='h-full'>
    <Toolbar class='align-content-center h-3rem mb-3 px-2 py-0 surface-0'>
      <template #start>
        <div class='align-items-center flex gap-2'>
          <div class='font-bold'>
            {{ t('Loại phân quyền') }}
          </div>
        </div>
      </template>
    </Toolbar>
    <div
      class='border-1 border-300 border-round-sm flex flex-column gap-2 p-3 surface-0'
      style='height: calc(100vh - 11rem)'>
      <div>
        <div class='flex flex-column row-gap-3'>
          <NamedDropdown
            id='employeeCode'
            v-model='selectedType'
            :filter='true'
            input-id='applicationStatus'
            name='employeeCode'
            option-label='label'
            option-value='type'
            :options='listType'
            :placeholder='t("Chọn loại phân quyền")'
            style='width: 100%'/>
        </div>
      </div>

      <div>
        <span class='block font-bold mb-3 ml-2 text-lg'>{{ t('Vai trò') }}</span>
        <div class='flex flex-column px-3 row-gap-3'>
          <div
            v-for='role in roles'
            :key='role.code'
            class='align-items-center flex gap-2'>
            <RadioButton
              v-model='selectedRole'
              :value='role'/>
            <label
              class='ml-2'>{{ role?.name }}</label>
          </div>
        </div>
      </div>

      <div>
        <span
          class='block font-bold mb-3 ml-2 text-lg'>{{
            'Danh sách người dùng cùng vai trò'
          }} {{ ' (' + (listUsers ? listUsers.length : 0) + ')' }}
        </span>
        <div class='flex flex-column px-3 row-gap-3'>
          <div
            v-for='(user, index) in listUsers'
            :key='index'
            class='align-items-center flex gap-2'>
            <RadioButton
              v-model='selectedUser'
              name='selectedUser'
              none
              :value='user'/>
            <label
              class='ml-2'>{{ user?.fullName }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getUsersByRole } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import type { RoleInterface } from '@/apps/admin/model/role';
import type { RoleChangeEvent, UserChangeEvent } from '@/apps/work/views/config/permissionConfig/type';
import type { UserInterface } from '@/common/model/User';

const emits = defineEmits<{
  (e: 'user-change', event: UserChangeEvent): void,
  (e: 'role-change', event: RoleChangeEvent): void
}>();

const { t } = useI18n();
const listType = ref([{
  label: 'Phòng ban',
  type: 'ORG'
},
{
  label: 'Khác',
  type: 'OTHER'
}
]);

//Permission type
const selectedType = ref('ORG');

const {
  result: rolesResult,
  onResult: roleOnResult
} = getAllRolesPublic();
const roles = computed<RoleInterface[]>(() => {
  return rolesResult.value?.rolesPublic;
});
const selectedRole = ref<RoleInterface>({} as RoleInterface);
roleOnResult(res => {
  const roles = res.data.rolesPublic;
  if (roles?.length > 0) {
    selectedRole.value = cloneDeep(roles[0]);
  }
});
//Get user by role
const {
  result: userRoleResult,
  refetch: userRoleRefetch
} = getUsersByRole(selectedRole.value?.code || '');
const listUsers = computed(() => {
  return userRoleResult.value?.findByRole;
});
watch(selectedRole, role => {
  if (role) {
    userRoleRefetch({ role: role?.code });
  }
});
const selectedUser = ref<UserInterface>();
watch(selectedUser, user => {
  if (!user) {
    return;
  }
  const event: UserChangeEvent = {
    selectedRole: selectedRole.value,
    selectedType: selectedType.value,
    selectedUser: user
  };
  emits('user-change', event);
});
</script>

<style scoped>

</style>