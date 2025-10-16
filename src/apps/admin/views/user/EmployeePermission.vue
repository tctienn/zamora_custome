<template>
  <TreeTable
    v-model:expandedKeys='expandedOrganizations'
    v-model:selectionKeys='selectedOrganization'
    class='custom-tree'
    filter-mode='lenient'
    :filters='filters'
    :meta-key-selection='true'
    :row-hover='true'
    scroll-height='flex'
    :scrollable='true'
    selection-mode='checkbox'
    :style='{"height": "calc(100%)"}'
    :value='organizationTreeComputed'
    @node-select='(n) => nodeSelected=n'>

    <template #empty>
      <span class='font-bold text-600 text-center w-full'>{{
        t('common.emptyRecords', { itemType: toLower(t('admin.organization.objectName')) })
      }}</span>
    </template>

    <Column
      body-class='word-break-break-word max-w-11rem'
      expander
      field='ordinalNumber'
      :header='t("admin.organization.level")'
      header-class='justify-content-start w-auto '>
      <template #body='{node: {data: {ordinalNumber}}}'>
        <p :class='ordinalNumber?.split(".").length > 2 ? "" : "font-bold"'>{{ ordinalNumber }}</p>
      </template>
    </Column>
    <Column
      body-class='word-break-break-word'
      field='name'
      :header='t("admin.organization.name")'
      header-class='justify-content-start'>
      <template #body='{node: {data: {name, ordinalNumber}}}'>
        <p :class='ordinalNumber?.split(".").length > 2 ? "" : "font-bold"'>{{ name }}</p>
      </template>
    </Column>
    <Column
      body-class='word-break-break-word max-w-12rem justify-content-center'
      field='code'
      :header='t("admin.organization.shortName")'
      header-class='justify-content-center max-w-12rem'>
      <template #body='{node: {data: {code, ordinalNumber}}}'>
        <p :class='ordinalNumber?.split(".").length > 2 ? "" : "font-bold"'>{{ code }}</p>
      </template>
    </Column>
    <Column
      body-class='justify-content-center max-w-12rem'
      field='order'
      :header='t("common.type")'
      header-class='justify-content-center max-w-12rem'>
      <template #body='{node: {data: {type}}}'>
        {{ typeName(type) }}
      </template>
    </Column>

  </TreeTable>
</template>

<script setup lang='ts'>

import { camelCase, get, toLower } from 'lodash';
import Column from 'primevue/column';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableSelectionKeys } from 'primevue/treetable';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getListOrganizationIsDeleteFalseGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import {
  getAllConfiguredPermissions,
  getRoleByCodeIn,
} from '@/apps/admin/api/graphql/role-graphql-api';
import { Organization } from '@/apps/admin/model/organization';
import { type AppPermission, functionType } from '@/apps/admin/model/role/RoleFunctionPermission';
import { toastErrorData } from '@/common/helpers/custom-toast-service';
import { setOrdinalNumberTree } from '@/common/helpers/tree-node-utils';
import { expandTreeNodes, listToTree } from '@/common/helpers/utils';

const props = defineProps({
  userId: {
    type: String,
    default: null
  },
  userRoles: {
    type: [] as PropType<string[]>,
    default: null
  }
});

const getAllOrganizationLoading = ref(true);
const organizations = ref([]);
const expandedOrganizations = ref({});
const types = ref([
  {
    code: 'DV',
    name: 'Đơn vị'
  }, {
    code: 'PB',
    name: 'Phòng ban'
  }
]);
const organizationTree = ref<TreeNode[]>();
const filters = ref<{ [key: string]: string }>({});
const typeName = computed(() => (value: string) => {
  return types.value.find((t) => t.code == value)?.name;
});
const organizationTreeComputed = computed<TreeNode[]>(() => {
  return setOrdinalNumberTree(organizationTree.value);
});

const selectedOrganization = defineModel<TreeTableSelectionKeys>('selectedOrganization', { default: {} });
const nodeSelected = ref<TreeNode>();

const {
  onResult: getAllOrganizationResult,
  onError: getAllOrganizationError
} = getListOrganizationIsDeleteFalseGraphql();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.getListOrganizationIsDeleteFalse', []);

  organizationTree.value = listToTree(organizations.value.map((organization: Organization) => ({
    key: organization.code,
    data: {
      ...organization,
      countUser: organization?.users?.length ?? 0
    },
    parentId: organization.parentCode,
    children: []
  })), {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  });

  expandedOrganizations.value = expandTreeNodes(organizationTree.value, 'key');
  getAllOrganizationLoading.value = false;
});

getAllOrganizationError((error) => {
  getAllOrganizationLoading.value = false;
  toastErrorData({
    prefix: 'organization.errors',
    error
  });
});

const actions = defineModel('actions', {
  type: Array as () => string[],
  default: () => []
});
const selectedActions = ref<string[]>([]);
const functions = ref<TreeNode[]>([]);
const { t } = useI18n();

const roles = ref();
const { onResult: getAllConfiguredPermissionsOnResult } = getAllConfiguredPermissions(functionType.WEB.toString());

getAllConfiguredPermissionsOnResult((res) => {
  const permission = get(res, 'data.getAllConfiguredPermissions', []);
  functions.value = convertTree(permission);
});

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.getListOrganizationIsDeleteFalse', []);

  function sumCountUser(node: any) {
    let selfCount = node.data.countUser || 0;
    if (!node.children || node.children.length === 0) {
      node.data.countUser = selfCount;
      return selfCount;
    }
    let sum = selfCount;
    for (const child of node.children) {
      sum += sumCountUser(child);
    }
    node.data.countUser = sum;
    return sum;
  }

  organizationTree.value = listToTree(organizations.value.map((organization: Organization) => ({
    key: organization.code,
    data: {
      ...organization,
      countUser: organization?.users?.length ?? 0
    },
    parentId: organization.parentCode,
    children: []
  })), {
    id: 'key',
    parentId: 'parentId',
    children: 'children'
  });

  if (organizationTree.value && Array.isArray(organizationTree.value)) {
    for (const root of organizationTree.value) {
      sumCountUser(root);
    }
  }

  expandedOrganizations.value = expandTreeNodes(organizationTree.value, 'key');
  getAllOrganizationLoading.value = false;
});

getAllConfiguredPermissionsOnResult((res) => {
  const permission = get(res, 'data.getAllConfiguredPermissions', []);
  functions.value = convertTree(permission);
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

watch(actions, (newVal) => {
  if (newVal) {
    selectedActions.value = [...newVal];
  }
}, { immediate: true });

watch(() => props.userRoles, (value) => {
  getRoleByCodeIn(value).onResult((res) => {
    roles.value = res.data.getRoleByCodeIn;
  });
});
</script>

<style scoped>
.table-wrapper {
  max-height: 62vh;
  overflow-y: auto;
}

thead th {
  position: sticky;
  top: 0;
  color: #000000B2;
  background: #F5F5F5;
  z-index: 2;
}

table, th, td {
  border: 0.5px solid #ccc;
}

tbody tr:first-child:hover {
  background-color: #F5F5F5;
  color: #000000B2;
  transition: background-color 0.2s ease-in-out;
}

tbody tr:not(:first-child):hover {
  background-color: #EFFAFE;
  color: #000000B2;
  transition: background-color 0.2s ease-in-out;
}
</style>