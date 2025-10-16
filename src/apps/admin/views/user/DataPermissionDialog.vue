<template>
  <Dialog
    v-if='user'
    v-model:visible='visible'
    class='dialog-decentralization'
    :header="
      t('admin.user.personalDecentralization') +
        t(getGender(user?.gender) || '') +
        ' ' +
        user?.fullName
    "
    v-bind='{...DEFAULT_DIALOG_CONFIG, style: {
      "height": "90vh"
    }}'
    :style="{ width: '75vw' }"
    @hide='emits("hide-dialog-permission")'>
    <TabView v-model:activeIndex='tabIndex'>
      <TabPanel header='Phân vùng dữ liệu'>
        <div
          v-if='tabIndex === 0'
          class='flex gap-1'>
          <div
            class='bg-black-alpha-30 col-4'
            style='height: 62vh'>

            <span class='block font-bold mb-3 ml-2 text-lg'>{{ t('Chức năng phân quyền') }}</span>
            <div class='flex flex-column px-3 row-gap-3'>
              <NamedDropdown
                v-model='selectedType'
                :filter='true'
                name='type'
                option-label='label'
                option-value='value'
                :options='listType'
                :placeholder='t("Chọn loại phân quyền")'/>
            </div>
          </div>

          <div
            class='bg-black-alpha-30 col-8'
            style='height: 62vh'>
            <component
              :is='getComponent(selectedType)'
              v-model:selectedOrganization='orgSelected'
              :function-code='selectedType'/>
          </div>
        </div>
      </TabPanel>
      <TabPanel header='Phân quyền'>
        <div
          v-if='tabIndex === 1'
          style='height: 62vh'>
          <p
            v-if='functionsFiltered.length == 0'
            class='flex justify-content-center text-lg'>Hiện tại chưa có chức năng cần phân quyền</p>
          <Tree
            v-else
            v-model:expandedKeys='expandedFunctions'
            v-model:selectionKeys='selectedPermissions'
            class='border-round-sm card'
            filter-mode='lenient'
            scroll-height='calc(100vh - 26rem)'
            selection-mode='checkbox'
            :style='{
              "height": "calc(100vh - 25rem)"
            }'
            :value='functionsFiltered'>
            <template #nodeicon='{node}'>
              <AppIcon
                v-if='node.icon'
                class='p-1'
                :name='node.icon'/>
            </template>
          </Tree>
        </div>
      </TabPanel>

    </TabView>

    <div class='flex gap-1 justify-content-center'>
      <ButtonIcon
        icon='check'
        icon-size='1.3'
        label='Lưu'
        @click='savePermission'/>

      <ButtonIcon
        icon='arrow_back'
        icon-size='1.3'
        label='Quay lại'
        severity='danger'
        @click='emits("hide-dialog-permission")'/>
    </div>
  </Dialog>
</template>

<script setup lang='ts'>
import { camelCase, cloneDeep, get, toLower } from 'lodash';
import type { TreeExpandedKeys, TreeSelectionKeys } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import type { TreeTableSelectionKeys } from 'primevue/treetable';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllUserStatusActive } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getListOrganizationIsDeleteFalseGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getAllConfiguredPermissions, getRoleByCodeIn } from '@/apps/admin/api/graphql/role-graphql-api';
import {
  findUserPermissionByUserId,
  saveUserPermission
} from '@/apps/admin/api/graphql/user-permission';
import { type AppPermission, functionType } from '@/apps/admin/model/role/RoleFunctionPermission';
import OrganizationPermission from '@/apps/admin/views/user/EmployeePermission.vue';
import { getEmployeePermissionByUserId, saveEmployeePermission } from '@/apps/hrm/api/graphql/employeePermission';
import { getGender } from '@/apps/meeting/views/meeting/components/meeting-class';
import AppIcon from '@/common/components/app/AppIcon.vue';
import { DEFAULT_DIALOG_CONFIG } from '@/common/constants';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import { initSelectedOrg, } from '@/common/helpers/tree-node-utils';
import { checkTreeNodes } from '@/common/helpers/utils';
import type { User } from '@/common/model/User';

const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  },
  visibleDialog: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: null,
  },
  user: {
    type: Object as PropType<any>,
    default: {} as any,
  },
  optionSupport: {
    type: Array as PropType<any[]>,
    default: undefined,
  },
});
const emits = defineEmits(['hide-dialog-permission']);
const tabIndex = ref(0);
const expandedFunctions = ref<TreeExpandedKeys>({});
const functions = ref<TreeNode[]>([]);

const functionsDisabled = ref<TreeNode[]>([]);
const selectedPermissions = ref<TreeSelectionKeys>({});
const { onResult: getAllConfiguredPermissionsOnResult } = getAllConfiguredPermissions(functionType.WEB.toString());
const orgSelected = defineModel<TreeTableSelectionKeys>('selectedOrganization', { default: {} });
const visible = ref(props.visibleDialog);
const roles = ref();
const orgSelectedList = computed(() => {
  return Object.keys(orgSelected.value || {}).filter(
    key => orgSelected.value?.[key]?.checked
  );
});

getAllConfiguredPermissionsOnResult((res) => {
  const permission = get(res, 'data.getAllConfiguredPermissions', []);
  functions.value = convertTree(permission);
});

getRoleByCodeIn(props.user.roles).onResult((res) => {
  roles.value = res.data.getRoleByCodeIn;
  functionsDisabled.value = convertTree(buildAppPermissionsFromKeys(flatten(mergeAppPermissions(cloneDeep(res.data.getRoleByCodeIn).map((r: any) => r.apps.web)))));
});

function flatten(appPermissions: AppPermission[]) {
  const flattenFunctionPermissions: string[] = [];
  appPermissions.forEach(item => {
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

function buildAppPermissionsFromKeys(keys: string[]): AppPermission[] {
  const appMap = new Map<string, AppPermission>();

  keys.forEach(key => {
    const parts = key.split('/');
    if (parts.length === 0) {
      return;
    }

    const app = parts[0];
    if (!appMap.has(app)) {
      appMap.set(app, {
        app,
        modules: []
      });
    }
    const appPerm = appMap.get(app)!;

    if (parts.length >= 2) {
      const module = parts[1];
      let modPerm = appPerm.modules.find(m => m.module === module);
      if (!modPerm) {
        modPerm = {
          module,
          functions: []
        };
        appPerm.modules.push(modPerm);
      }

      if (parts.length >= 3) {
        const func = parts[2];
        let funcPerm = modPerm.functions.find(f => f.function === func);
        if (!funcPerm) {
          funcPerm = {
            function: func,
            actions: []
          };
          modPerm.functions.push(funcPerm);
        }

        if (parts.length >= 4) {
          const action = parts[3];
          if (!funcPerm.actions.includes(action)) {
            funcPerm.actions.push(action);
          }
        }
      }
    }
  });

  return Array.from(appMap.values());
}

const organizations = ref([]);
const users = ref();

const listType = ref([
  {
    label: 'Hồ sơ',
    value: 'EMPLOYEE',
    component: OrganizationPermission
  },
  {
    label: 'Hợp đồng',
    value: 'CONTRACT',
    component: OrganizationPermission
  },
  {
    label: 'Quyết định',
    value: 'DECISION',
    component: OrganizationPermission
  },
  {
    label: 'Công & Phép',
    value: 'WORKING_AND_LEAVE',
    component: OrganizationPermission
  },
  {
    label: 'Lương & Thuế',
    value: 'SALARY_AND_TAX',
    component: OrganizationPermission
  },
  {
    label: 'Bảo Hiểm',
    value: 'INSURANCE',
    component: OrganizationPermission
  },
  {
    label: 'Khen thưởng',
    value: 'REWARD',
    component: OrganizationPermission
  },
  {
    label: 'Đào tạo',
    value: 'TRAINING',
    component: OrganizationPermission
  },
  {
    label: 'Tuyển dụng',
    value: 'RECRUITMENT',
    component: OrganizationPermission
  },
  {
    label: 'Đánh giá',
    value: 'EVALUATE',
    component: OrganizationPermission
  },
  {
    label: 'Khảo sát',
    value: 'SURVEY',
    component: OrganizationPermission
  },
  {
    label: 'Quy hoạch',
    value: 'PLANING',
    component: OrganizationPermission
  },
  {
    label: 'Tổ chức',
    value: 'ORGANIZATION',
    component: OrganizationPermission
  },
  {
    label: 'Kho số hóa',
    value: 'DIGITIZED_FOLDER',
    component: OrganizationPermission
  },
  {
    label: 'Báo cáo',
    value: 'REPORT',
    component: OrganizationPermission
  },
  {
    label: 'Danh mục',
    value: 'CATEGORY',
    component: OrganizationPermission
  },
  {
    label: 'Thiết lập',
    value: 'SETTING',
    component: OrganizationPermission
  },
  {
    label: 'Khác',
    value: 'OTHER',
    component: OrganizationPermission
  }
]);

const selectedType = ref(listType.value[0].value);
const getComponent = (type: string) => {
  return listType.value.find(item => item.value === type)?.component || null;
};

const { onResult: getAllOrganizationResult, } = getListOrganizationIsDeleteFalseGraphql();
const {
  onResult: getEmployeePermissionResult,
  load: getEmployeePermissionLoad
} = getEmployeePermissionByUserId();

getAllOrganizationResult((response) => {
  organizations.value = get(response, 'data.getListOrganizationIsDeleteFalse', []);
});

getEmployeePermissionResult((res) => {
  orgSelected.value = {};
  config.value = res.data?.getEmployeePermissionByUserId;
  if (config.value?.organizationCodes) {
    orgSelected.value = initSelectedOrg('checkbox', config.value.organizationCodes, organizations.value);
  }
});

getEmployeePermissionLoad(undefined, {
  userId: props.id,
  functionType: listType.value[0].value
});

const { t } = useI18n();
const config = ref();

getAllUserStatusActive().onResult((res) => {
  users.value = res.data.getAllUserStatusActive.map((u: User) => ({
    id: u.id,
    name: `${u.fullName} - ${u.username} - ${u.email}`
  }));
});

function savePermission() {
  if (tabIndex.value == 0) {
    saveEmployeePermission().mutate({
      payload: {
        userId: props.id,
        organizationCodes: orgSelectedList.value,
        functionType: selectedType.value
      }
    }).then(() => {
      toastSuccess({ message: 'Cập nhật phân quyền thành công.' });
    });
  } else {
    const codeFunction = Object.entries(selectedPermissions.value)
      .filter(([_, value]) => value.checked)
      .map(([key]) => key);

    saveUserPermission().mutate({
      modulePermissionPayload: {
        userId: props.id,
        apps: codeFunction
      }
    }).then(() => {
      toastSuccess({ message: 'Cập nhật phân quyền thành công.' });
    });
  }
}

watch(selectedType, (value) => {
  getEmployeePermissionLoad(undefined, {
    userId: props.id,
    functionType: value
  });
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

function mergeAppPermissions(data: AppPermission[][]): AppPermission[] {
  const map = new Map<string, AppPermission>();

  data.flat().forEach(appPerm => {
    if (!map.has(appPerm.app)) {
      map.set(appPerm.app, {
        app: appPerm.app,
        modules: [...appPerm.modules]
      });
    } else {
      const existing = map.get(appPerm.app)!;
      appPerm.modules.forEach(mod => {
        const existMod = existing.modules.find(m => m.module === mod.module);
        if (!existMod) {
          existing.modules.push({
            ...mod,
            functions: [...mod.functions]
          });
        } else {
          mod.functions.forEach(func => {
            const existFunc = existMod.functions.find(f => f.function === func.function);
            if (!existFunc) {
              existMod.functions.push({
                ...func,
                actions: [...func.actions]
              });
            } else {
              existFunc.actions = Array.from(new Set([...existFunc.actions, ...func.actions]));
            }
          });
        }
      });
    }
  });

  return Array.from(map.values());
}

watch(tabIndex, (value) => {
  if (value == 1) {
    findUserPermissionByUserId(props.id).onResult((res) => {
      const modulePermission = res.data?.findUserPermissionByUserId;
      if (modulePermission?.apps) {
        selectedPermissions.value = checkTreeNodes(functions.value, {}, flatten(modulePermission?.apps));
      }
    });
  }
});

function filterTree(nodes: TreeNode[], disabledKeys: Set<string>): TreeNode[] {
  return nodes
    .filter(node => !disabledKeys.has(node.key as string))
    .map(node => ({
      ...node,
      children: node.children ? filterTree(node.children, disabledKeys) : []
    }));
}

function collectKeys(nodes: TreeNode[], keys: Set<string>) {
  nodes.forEach(node => {
    keys.add(node.key as string);
    if (node.children) {
      collectKeys(node.children, keys);
    }
  });
  return keys;
}

const functionsFiltered = computed(() => {
  const disabledKeys = collectKeys(functionsDisabled.value, new Set<string>());
  return filterTree(functions.value, disabledKeys);
});

</script>

<style scoped>
:deep(.dialog-decentralization) {
  padding: 0
}
</style>
