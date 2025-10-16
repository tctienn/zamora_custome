<template>
  <span class='block font-bold mb-3 ml-2 text-lg'>
    {{ t('admin.role.titleRolePermission') }}: {{ selectedRoleCodeName }}
  </span>
  <Tree
    v-model:expandedKeys='expandedFunctions'
    v-model:selectionKeys='selectedPermissions'
    class='border-round-sm card'
    :filter='!!(functions && functions.length)'
    filter-mode='lenient'
    selection-mode='checkbox'
    :value='functions'>
    <template #nodeicon='{node}'>
      <AppIcon
        v-if='node.icon'
        class='p-1'
        :name='node.icon'/>
    </template>
  </Tree>

  <div class='flex flex-row justify-content-center'>
    <ButtonIcon
      icon='check'
      :label='t("common.save")'
      @click='saveRolePermissions'/>
  </div>

</template>

<script setup lang='ts'>

import { camelCase, get, isEmpty, toLower } from 'lodash';
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  getAllConfiguredPermissions,
  getRolesByStatus,
  updateAppFunction
} from '@/apps/admin/api/graphql/role-graphql-api';
import { type AppPermission, functionType, type Role } from '@/apps/admin/model/role/RoleFunctionPermission';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { ACTIVITY_STATUSES, ADMIN } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { checkTreeNodes } from '@/common/helpers/utils';

const props = defineProps({
  roleCode: {
    type: String,
    default: undefined
  }
});
const { t } = useI18n();
const {
  onResult: getRolesByStatusOnResult,
  refetch: getRolesByStatusRefetch
} = getRolesByStatus(ACTIVITY_STATUSES.ACTIVE);
const { onResult: getAllConfiguredPermissionsOnResult } = getAllConfiguredPermissions(functionType.WEB.toString());
const expandedFunctions = ref<TreeExpandedKeys>({});
const functions = ref<TreeNode[]>([]);
let roles = ref<Role[]>([]);
const selectedRoleCode = ref(ADMIN);
const selectedPermissions = ref<TreeSelectionKeys>({});
const rolePermissions = ref([{}]);
const isSystemAdmin = computed(() => props.roleCode === ADMIN);
const roleIndex = computed(() => roles.value.findIndex(role => role.code === props.roleCode));
const roleModel = defineModel('roleModel', {
  type: Object as PropType<Role | undefined>,
  default: undefined
});
const {
  mutate: updateRoleMutate,
  onDone: updateRoleOnDone,
} = updateAppFunction();

getAllConfiguredPermissionsOnResult((res) => {
  const permission = get(res, 'data.getAllConfiguredPermissions', []);
  functions.value = convertTree(permission);
});

getRolesByStatusOnResult((response) => {
  roles.value = get(response, 'data.getRolesByStatus', []);
  selectedPermissions.value = checkTreeNodes(functions.value, {}, flatten(roles.value.find(e => e.code == selectedRoleCode.value) || ({} as Role)));
});

const selectedRoleCodeName = computed(() => {
  if (roleIndex.value >= 0) {
    return t(roles.value[roleIndex.value].name);
  } else {
    return '';
  }
});

watch(roleModel, (value) => {
  selectedPermissions.value = checkTreeNodes(functions.value, {}, flatten(value || ({} as Role)));
});

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

watch(() => props.roleCode, (value, oldValue) => {
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
      code: roleModel.value?.code,
      name: roleModel.value?.name,
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

<style scoped>

</style>