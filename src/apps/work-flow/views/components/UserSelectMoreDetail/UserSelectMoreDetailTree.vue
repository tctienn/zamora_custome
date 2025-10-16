<template>
  <div
    v-if='!isHideSearch'
    class='p-2 p-tree-filter-container relative'>
    <IconField icon-position='right'>
      <InputText
        v-model='searchTerm'
        class='p-component p-inputtext p-tree-filter'/>
      <InputIcon class='pi pi-search'></InputIcon>
    </IconField>
  </div>
  <Tree
    v-model:selection-keys='selectedUserIds'
    class='bg-transparent border-none p-2'
    :expanded-keys='expandKeys'
    :pt='{
      toggler:{
        "aria-hidden":false,
      }}'
    :selection-mode='selectionMode'
    :value='filteredTreeNodes'
    v-bind='$attrs'
    @node-select='nodeSelectHandle'
    @node-unselect='nodeUnselectHandle'>
    <template
      #default='{node:nodeDataTem}'>
      <div class='align-items-center flex'>
        <Checkbox
          v-if="selectionMode!='checkbox' && shouldShowCheckbox(nodeDataTem) "
          :binary='true'
          :model-value='selectedUserIds?.[nodeDataTem?.key||""]'></Checkbox>
        <div
          v-if='nodeDataTem?.data?.__typename=="UserOrganizationData"'>
          <AppUserDeptRole
            avatar-size='3'
            info-visible
            :infos='["positionName","roleName"]'
            name-visible
            :user-dept-role='nodeDataTem?.data'/>
        </div>
        <div v-else-if='nodeDataTem?.data?.__typename=="UserMoreInfo"'>
          <AppUserDeptRole
            avatar-size='3'
            info-visible
            :infos='[ "positionName","roleName","deptName"]'
            name-visible
            :user-dept-role='nodeDataTem?.data'/>
        </div>
        <div
          v-else
          class='font-semibold word-break-break-word'>
          {{ truncateString(nodeDataTem?.label || "", 100) }}
        </div>
      </div>
    </template>
  </Tree>
</template>

<script lang="ts" setup>
import { get, groupBy, isEqual } from 'lodash';
import { storeToRefs } from 'pinia';
import type Tree from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { Department, UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import { getAllUserOrganization } from '@/apps/document/api/graphql/userOrganization';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType, type UserOrganization } from '@/apps/document/model/organization';
import AppUserDeptRole from '@/common/components/app/AppUserDeptRole.vue';
import { truncateString } from '@/common/helpers/string-util';
import {
  type CheckStatus,
  filterTreeNodes,
  findTreeNodeByKey,
  rebuildTreeCheckBox
} from '@/common/helpers/tree-node-utils';
import { listToTree, normalizeString } from '@/common/helpers/utils';

const props = defineProps({
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox' | undefined>,
    default: undefined,
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => []
  },
  // node: {
  //   type: Object as PropType<NodeInputInterface>,
  //   default: undefined
  // },
  userIdOnly: {
    type: Boolean,
    default: false
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true
  },
  removeEmptyDep: {
    type: Boolean,
    default: false
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
  isHideSearch: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['node-select', 'node-unselect']);
const valueSearch = defineModel<string>('valueSearch', { default: '' });
// Initialize internationalization
const { t } = useI18n();

// State management
const selectedUserIds = defineModel<Record<string, true> | CheckStatus>({ default: {} });
const expandKeys = ref();
const noDepId = Date.now();
// Maps users to tree nodes
const { result } = getAllRolesPublic();
const mapRoleName = computed(() => {
  return new Map<string, string>(result?.value?.rolesPublic?.map((role: {
    code: string,
    name: string
  }) => [role.code, role.name]));
});
const transformUserMoreInfo = computed(() => {
  const rs: Array<UserDeptRoleInput & { __typename: string }> = [];
  props.users?.forEach((u: UserMoreInfo) => {
    u.roles?.forEach(role => {
      u.departments?.forEach((dep: Department) => {
        rs.push({
          __typename: 'UserMoreInfo',
          userId: u.id,
          roleName: mapRoleName.value.get(role) || '',
          userName: u.fullName,
          deptName: dep.name,
          deptId: dep.id || '',
          roleId: role,
          type: OrganizationType.ADMINISTRATIVE
        });
      });
    });
  });
  return rs;
});

const orgUserMap = computed(() => {
  const map: { [orgCode: string]: TreeNode[] } = {};
  transformUserMoreInfo.value.forEach(user => {
    {
      const userNode: TreeNode = {
        key: user.userId + '_' + user.roleId,
        label: user.userName,
        data: {
          ...user,
          userId: user.userId
        },
      };

      if (user.deptId === '') {
        map[noDepId] = [...map[noDepId] || [], userNode];
      } else {
        map[user.deptId] = [...map[user.deptId] || [], userNode];
      }
    }
  });
  return map;
});

// Options for the tree select
const orgUserOptions = computed(() => {
  if (props.orgType === OrganizationType.ADMINISTRATIVE) {
    // const rootNode: TreeNode = {
    //   key: 'org_root',
    //   label: t('work-flow.task.orgTree'),
    //   data: {
    //     __typename: 'Organization',
    //     id: 'root',
    //     orgName: 'root'
    //   }
    // };

    const treeNodes = allOrg.value.map(org => ({
      id: `org_${org.code}`,
      key: `org_${org.id}`,
      label: org.name,
      data: org,
      parentId: `org_${org.parentCode}`,
      children: orgUserMap.value[org.id],
    }));

    let tree: TreeNode[] = listToTree(treeNodes, {
      id: 'id',
      parentId: 'parentId',
      children: 'children',
    });

    if (props.removeEmptyDep) {
      tree = filterTreeNodes(tree, node => (node?.children?.length || -1) < 0 && node.data?.__typename === 'UserMoreInfo');
    }

    // rootNode.children = [...tree, ...orgUserMap.value[noDepId] || []];
    return [...tree, ...orgUserMap.value[noDepId] || []];
  }

  if (props.removeEmptyDep) {
    return filterTreeNodes(partyRootNode.value || [], node => (node?.children?.length || -1) < 0 && node.data?.__typename === 'UserOrganizationData');
  }

  return partyRootNode.value || [];
});

const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());
const { result: resultAdmin } = getAllOrganizationPublicGraphql();
const { onResult: orgOnResult, result: resultParty } = getAllOrg();
const partyRootNode = ref<TreeNode[]>([]);

orgOnResult(allOrgResult => {
  const allOrg = get(allOrgResult, 'data.getAll', []);
  const groupByTypeAllOrg = groupBy(allOrg, value => value.type);
  const result: { [orgCode: string]: TreeNode[] } = {};
  const mapOrgIdName = new Map<string, string>(allOrg.map((org: {
    id: string,
    name: string
  }) => [org.id, org.name]));
  getAllUserOrganization().onResult(param1 => {
    const listUser = get(param1, 'data.getAllUserOrganization', []);
    listUser.forEach((user: UserOrganization) => {
      // const orgRole = getRolesByOrgId(user.organizationId, orgRoles.value);
      // if (!nodeData?.options || userIds?.includes(user.id)
      //     || isExistOrgId(user.organizationId, orgRoles.value) && (orgRole.length === 0 || orgRole.includes(user.role))
      // )
      {
        const userNode: TreeNode = {
          key: user.userId + '_' + user.role,
          label: usersMoreInfo.value?.[user.userId]?.fullName,
          data: {
            ...user,
            userName: usersMoreInfo.value?.[user.userId]?.fullName,
            deptId: user.organizationId,
            deptName: mapOrgIdName.get(user.organizationId)
          },
        };
        result[user.organizationId] = [...result[user.organizationId] || [], userNode];
      }
    });

    partyRootNode.value = listToTree(
      (groupByTypeAllOrg?.[props.orgType] || []).map(organization => ({
        key: `org_${organization.id}`,
        label: organization.name,
        data: organization,
        parentId: `org_${organization.parentId}`,
        children: result[organization.id],
      })),
      {
        id: 'key',
        parentId: 'parentId',
        children: 'children',
      }
    );
  });
});

const treeOptions = computed(() => orgUserOptions.value);

const allOrg = computed(() => get(resultAdmin.value, 'allOrganizationPublic', []) as OrganizationInterface[]);
const searchTerm = valueSearch;
const filteredTreeNodes = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value.trim());
  return filterTreeNodes((treeOptions.value || []) as TreeNode[], (node) => {
    if (searchTerm.value.trim().length == 0) {
      return true;
    }
    const normalizedLabel = normalizeString(node.label || '');
    return normalizedLabel.includes(normalizedSearchTerm);
  }
  );
});

watch(filteredTreeNodes, (value) => {
  expandKeys.value = initExpandKeys(value);
});

function initExpandKeys(treeNodes: TreeNode[]) {
  const rs: Record<string, true> = {};
  treeNodes.forEach((node) => {
    rs[node.key || ''] = true;
  });
  return rs;
}

const userIds = defineModel<Array<UserDeptRoleInput & { id: string }>>('userIds', { default: [] });

watch([treeOptions, () => userIds.value], ([newValue, newUserIds], [oldValue, oldUserIds]) => {
  if (props.selectionMode === 'checkbox') {
    if (!isEqual(newUserIds, oldUserIds) || !isEqual(newValue, oldValue)) {
      selectedUserIds.value = rebuildTreeCheckBox(newUserIds.map(e => e.id), newValue);
    }
  } else {
    if (!isEqual(newUserIds, oldUserIds) || !isEqual(newValue, oldValue)) {
      const rs: Record<string, true> = {};
      newUserIds.forEach(e => rs[e.id] = true);
      selectedUserIds.value = rs;
    }

  }

}, { immediate: true, });
watch(selectedUserIds, (value, oldValue) => {
  if (props.selectionMode == 'checkbox') {
    let temp = Object.entries(value).filter(([key, value]) => {
      return value.checked == true;
    });
    if (props.userIdOnly) {
      temp = temp.filter(([key, value]) => {
        return !key.startsWith('org_');
      });
    }
    if (!isEqual(value, oldValue)) {
      userIds.value = temp.map(([key, value]) => {
        return {
          ...findTreeNodeByKey(key, treeOptions.value)?.data as UserDeptRoleInput,
          id: key
        };
      });
    }
  }
});

function nodeSelectHandle(node: TreeNode) {
  emits('node-select', node);
}

function nodeUnselectHandle(node: TreeNode) {
  emits('node-unselect', node);

}
</script>

<style scoped>

</style>