<template>
  <div
    class='column-gap-3 flex'
    style='height:calc(100vh - 6rem)'>
    <div class='border-round-sm col-3 overflow-auto'>
      <PermissionConfigLeftPanel
        @role-change='roleChange'
        @user-change='userChange'>
      </PermissionConfigLeftPanel>
    </div>
    <div class='border-round-sm col pb-0'>
      <PermissionConfigRightPanel
        :header='header'
        :selected-dept='selectedDeptIds'
        @save='saveConfig'>
      </PermissionConfigRightPanel>
    </div>
  </div>
</template>

<script lang='ts' setup>

import { computed, reactive, ref, watch } from 'vue';

import type { RoleInterface } from '@/apps/admin/model/role';
import type { UserInterface } from '@/apps/admin/model/User';
import { savePermissionConfig, searchPermissionConfig } from '@/apps/work/api/graphql/permission-api';
import type { PermissionConfig } from '@/apps/work/model/permissionConfig';
import PermissionConfigLeftPanel from '@/apps/work/views/config/permissionConfig/PermissionConfigLeftPanel.vue';
import PermissionConfigRightPanel from '@/apps/work/views/config/permissionConfig/PermissionConfigRightPanel.vue';
import type { RoleChangeEvent, UserChangeEvent } from '@/apps/work/views/config/permissionConfig/type';
import { toastSuccess } from '@/common/helpers/custom-toast-service';

const header = ref<string>();
const selectedUser = ref<any>();
const selectedRole = ref<RoleInterface>();
const selectedType = ref<string>();

function userChange(event: UserChangeEvent) {
  selectedType.value = event.selectedType;
  selectedRole.value = event.selectedRole;
  selectedUser.value = event.selectedUser;
}

function roleChange(event: RoleChangeEvent) {

}

//
const {
  load: loadConfig,
  refetch: refetchConfig,
  result: resultConfig
} = searchPermissionConfig();

watch(selectedUser, user => {
  if (user) {
    const variables = {
      permissionType: selectedType.value,
      roleCode: selectedRole.value?.code,
      userId: selectedUser.value?.id
    };
    loadConfig(null, { ...variables })
    || refetchConfig({ ...variables });
  }
});
const selectedDeptIds = computed(() => {
  return resultConfig.value?.searchPermissionConfig?.deptIds || [];
});
const permissionConfig: PermissionConfig = reactive({ permissionType: selectedType.value, });
const { mutate: permissionConfigMutate } = savePermissionConfig();

function saveConfig(deptIds: string[]) {
  permissionConfig.permissionType = selectedType.value;
  permissionConfig.roleCode = selectedRole.value?.code;
  permissionConfig.userId = selectedUser.value?.id;
  permissionConfig.deptIds = deptIds;

  permissionConfigMutate({ config: permissionConfig })
    .then(() => {
      toastSuccess({ message: 'Lưu thành công' });
    });
}
</script>

<style scoped>

</style>