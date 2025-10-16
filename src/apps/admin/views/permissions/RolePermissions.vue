<template>
  <div class='column-gap-3 grid h-full ml-2 mt-2 w-full'>
    <div class='border-round-sm col-3 field h-full surface-0'>
      <span class='block font-bold mb-3 ml-2 text-lg'>{{ t('admin.role.chooseRolePermission') }}</span>
      <div class='flex flex-column px-3 row-gap-3'>
        <div
          v-for='(role, index) in roles'
          :key='index'
          class='role'>
          <RadioButton
            v-model='selectedRoleCode'
            :input-id='`role_${toLower(role.code)}`'
            name='selectedRoleCode'
            :value='role.code'
            @change='chooseRole(role as Role)'/>
          <label
            class='ml-2'
            :for='`role_${toLower(role.code)}`'>{{ role.name }}</label>
        </div>
      </div>
    </div>

    <div class='border-round-sm col flex-1 h-full mr-4 surface-0'>
      <TabView>
        <TabPanel header='Web'>
          <WebPermissions
            v-model:role-model='roleRef'
            :role-code='selectedRoleCode'/>
        </TabPanel>
        <TabPanel header='Mobile'>
          <MobilePermissions
            v-model:role-model='roleRef'
            :role-code='selectedRoleCode'/>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { camelCase, get, isEmpty, toLower } from 'lodash';
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllConfiguredPermissions,
  getRolesByStatus,
  updateAppFunction
} from '@/apps/admin/api/graphql/role-graphql-api';
import {
  type AppPermission,
  functionType,
  type Role,
  type WebMobileApps
} from '@/apps/admin/model/role/RoleFunctionPermission';
import MobilePermissions from '@/apps/admin/views/permissions/MobilePermissions.vue';
import WebPermissions from '@/apps/admin/views/permissions/WebPermissions.vue';
import { ACTIVITY_STATUSES, ADMIN } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { checkTreeNodes } from '@/common/helpers/utils';

const { t } = useI18n();
const {
  onResult: getRolesByStatusOnResult,
  refetch: getRolesByStatusRefetch
} = getRolesByStatus(ACTIVITY_STATUSES.ACTIVE);
const { onResult: getAllConfiguredPermissionsOnResult } = getAllConfiguredPermissions(functionType.WEB.toString());
const functions = ref<TreeNode[]>([]);
let roles = ref<Role[]>([]);
const selectedRoleCode = ref(ADMIN);
const selectedPermissions = ref<TreeSelectionKeys>({});
const expandedFunctions = ref<TreeExpandedKeys>({});
const rolePermissions = ref([{}]);
const isSystemAdmin = computed(() => selectedRoleCode.value === ADMIN);
const roleIndex = computed(() => roles.value.findIndex(role => role.code === selectedRoleCode.value));
const roleRef = ref({} as Role);
const {
  mutate: updateRoleMutate,
  onDone: updateRoleOnDone,
} = updateAppFunction();

getAllConfiguredPermissionsOnResult((res) => {
  const permission = get(res, 'data.getAllConfiguredPermissions', []);
  functions.value = convertTree(permission);
  chooseRole(roles?.value.find(e => e.code == selectedRoleCode.value) as Role);
});

getRolesByStatusOnResult((response) => {
  roles.value = get(response, 'data.getRolesByStatus', []);
  selectedPermissions.value = checkTreeNodes(functions.value, {}, flatten(roles.value.find(e => e.code == selectedRoleCode.value) || ({} as Role)));
});

function chooseRole(role: Role) {
  roleRef.value = role;
  selectedPermissions.value = checkTreeNodes(functions.value, {}, flatten(role));
}

function flatten(role: Role) {
  const flattenFunctionPermissions: string[] = [];
  role.apps.web.forEach(item => {
    flattenFunctionPermissions.push(item.app);
    if (item.modules && item.modules.length) {
      item.modules.forEach(module => {
        flattenFunctionPermissions.push(item.app + '/' + module.module);
        if (module.functions && module.functions.length) {
          module.functions.forEach(fun => {
            flattenFunctionPermissions.push(item.app + '/' + module.module + '/' + fun.function);
            fun.actions.forEach(action => {
              flattenFunctionPermissions.push(item.app + '/' + module.module + '/' + fun.function + '/' + action);
            });
          });
        }
      });
    }
  });

  return flattenFunctionPermissions;
}

const selectedRoleCodeName = computed(() => {
  if (roleIndex.value >= 0) {
    return t(roles.value[roleIndex.value].name);
  } else {
    return '';
  }
});

function convertTree(permission: AppPermission[]): TreeNode[] {
  return permission.map(per => ({
    label: t(`components.${toLower(per.app)}`),
    key: per.app,
    icon: 'widgets',
    children: per.modules.map(mod => ({
      key: per.app + '/' + mod.module,
      label: t(`${camelCase(per.app)}.menu.${camelCase(mod.module)}`),
      icon: 'package_2',
      children: mod.functions.map(func => ({
        key: per.app + '/' + mod.module + '/' + func.function,
        label: t(`${camelCase(per.app)}.menu.${camelCase(func.function)}`),
        children: func.actions.map(app => ({
          key: per.app + '/' + mod.module + '/' + func.function + '/' + app,
          label: t(`common.${camelCase(app)}`),
          icon: 'line_start_circle'
        }))
      }))
    }))
  }));
}

watch(selectedRoleCode, (value, oldValue) => {
  if (isSystemAdmin.value) {
    selectedPermissions.value = checkTreeNodes(functions.value, selectedPermissions.value, flatten(roles.value[0]));
    return;
  }
  if (!isEmpty(oldValue) && !isEmpty(value)) {
    if (roleIndex.value >= 0) {
      // getRolePermissionsRefetch({ roleCode: selectedRoleCode.value });
    } else {
      rolePermissions.value = [{}];
    }
  }
});

function saveRolePermissions() {
  const role = roles.value.find(role => role.code === selectedRoleCode.value);
  if (role) {
    const keys = Object.keys(selectedPermissions.value);
    const permissionInput = {
      code: role.code,
      name: role.name,
      permissions: keys
    };
    updateRoleMutate({ permissionInput });
  }
}

updateRoleOnDone((response) => {
  toastSuccess({
    message: t('common.result.message.configured', {
      //itemType: t('role.objectName'),
      itemName: roles.value[roleIndex.value].name
    })
  });
  getRolesByStatusRefetch();
});
</script>

<script lang='ts'>
export default { name: 'ConfigRolePermissions' };
</script>

<style scoped>
.card {
  max-height: calc(100vh - 16rem);
  overflow-y: auto;
}
</style>