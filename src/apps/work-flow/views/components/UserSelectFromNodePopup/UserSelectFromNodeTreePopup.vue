<template>
  <div class='p-3 p-tree-filter-container pb-0 relative'>
    <InputText
      v-model='searchTerm'
      class='p-component p-inputtext p-tree-filter pr-5'/>
    <span
      class='absolute pi pi-search'
      style='right:1.5rem;top:2rem'></span>
  </div>
  <Tree
    v-model:selection-keys='selectedUserIds'
    class='border-none'
    :selection-mode='selectionMode'
    :value='filteredTreeNodes'
    v-bind='$attrs'
    @node-select='nodeSelectHandle'
    @node-unselect='nodeUnselectHandle'>
    <template
      #default='{node:nodeDataTem}'>
      <div class='align-items-center flex'>
        <Checkbox
          v-if="selectionMode!='checkbox'"
          :binary='true'
          :model-value='selectedUserIds?.[nodeDataTem?.key||""]'></Checkbox>
        <div
          v-if='nodeDataTem?.data?.__typename=="UserOrganizationData"||nodeDataTem?.data?.__typename=="UserMoreInfo"'>
          <AppUser
            avatar-size='3'
            info-visible
            :infos='["email", "positionName"]'
            name-visible
            :user-id='nodeDataTem?.key'/>
        </div>
        <div
          v-else
          class='font-semibold'>
          {{ nodeDataTem.label }}
        </div>
      </div>
    </template>
  </Tree>
</template>

<script lang='ts' setup>
import { get, groupBy, isEqual } from 'lodash';
import type Tree from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import { getAllUserOrganization } from '@/apps/document/api/graphql/userOrganization';
import { OrganizationType } from '@/apps/document/model/organization';
import type { OrgRole } from '@/apps/work-flow/model/flow';
import { type CheckStatus, filterTreeNodes, rebuildTreeCheckBox } from '@/common/helpers/tree-node-utils';
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
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true
  },
  removeEmptyDep: {
    type: Boolean,
    default: false
  },
  userIds: {
    type: Array as PropType<string[]>,
    default: () => []
  }
});

// Initialize internationalization
const { t } = useI18n();
// const selectId = defineModel<Record<string, true>>('selectId', { default: {} });
const selectedUserIds = defineModel<Record<string, true> | CheckStatus>({ default: {} });
// if (selectId.value) {
//   selectedUserIds.value = selectId.value;
//   nodeSelectHandle(selectedUserIds.value);
// }
// State management
// const nodeData = props.node?.data as BasicNodeData;
// const orgType = ref<OrganizationType>(nodeData?.orgType || OrganizationType.ADMINISTRATIVE);
// const orgRoles = ref<OrgRole[]>(nodeData?.options?.orgRoles || []);
// const userIds = nodeData?.options?.userIds || [];
const noDepId = Date.now();
// Maps users to tree nodes
const orgUserMap = computed(() => {
  const map: { [orgCode: string]: TreeNode[] } = {};
  props.users.forEach(user => {
    // if (!nodeData?.options || userIds?.includes(user.id)
    //     || user.departments.some(dep => {
    //       const orgRole = getRolesByOrgId(dep.code, orgRoles.value);
    //       return isExistOrgId(dep.code, orgRoles.value) && (orgRole.length === 0 || orgRole.includes(user.position));
    //     })
    // )
    {
      const userNode: TreeNode = {
        key: user.id,
        label: user.fullName,
        data: user,
      };

      if (user.departments.length === 0) {
        map[noDepId] = [...map[noDepId] || [], userNode];
      } else {
        user.departments.forEach(dep => {
          map[dep.code] = [...map[dep.code] || [], userNode];
        });
      }
    }
  });
  return map;
});

// Options for the tree select
const orgUserOptions = computed(() => {
  if (props.orgType === OrganizationType.ADMINISTRATIVE) {
    // const rootNode: TreeNode = {
    //   key: 'org_',
    //   label: t('work-flow.task.orgTree'),
    // };

    const treeNodes = allOrg.value.map(org => ({
      key: `org_${org.code}`,
      label: org.name,
      data: org.code,
      type: 'custom',
      parentId: `org_${org.parentCode}`,
      children: orgUserMap.value[org.code],
    }));

    let tree: TreeNode[] = listToTree(treeNodes, {
      id: 'key',
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

const { usersMoreInfo } = useUserMoreInfoStore();
const { result: resultAdmin } = getAllOrganizationGraphql();
const {
  onResult: orgOnResult,
  result: resultParty
} = getAllOrg();
const partyRootNode = ref<TreeNode[]>([]);

orgOnResult(allOrgResult => {
  const allOrg = get(allOrgResult, 'data.getAll', []);
  const groupByTypeAllOrg = groupBy(allOrg, value => value.type);
  const result: { [orgCode: string]: TreeNode[] } = {};

  getAllUserOrganization().onResult(param1 => {
    const listUser = get(param1, 'data.getAllUserOrganization', []);
    listUser.forEach((user: any) => {
      // const orgRole = getRolesByOrgId(user.organizationId, orgRoles.value);
      // if (!nodeData?.options || userIds?.includes(user.id)
      //     || isExistOrgId(user.organizationId, orgRoles.value) && (orgRole.length === 0 || orgRole.includes(user.role))
      // )
      {
        const userNode: TreeNode = {
          key: user.userId,
          label: usersMoreInfo?.[user.userId]?.fullName,
          data: user,
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

function getRolesByOrgId(orgId: string, orgRoles: OrgRole[]): string[] {
  return orgRoles.find(e => e.orgId === orgId)?.roles || [];
}

function isExistOrgId(orgId: string, orgRoles: OrgRole[]): boolean {
  if (orgRoles.length === 0) {
    return true;
  }
  return orgRoles.some(e => e.orgId === orgId);
}

const allOrg = computed(() => get(resultAdmin.value, 'allOrganizationPublic', []) as OrganizationInterface[]);
const searchTerm = ref<string>('');
const filteredTreeNodes = computed(() => {
  const normalizedSearchTerm = normalizeString(searchTerm.value);
  return filterTreeNodes((treeOptions.value || []) as TreeNode[], (node) => {
    if (searchTerm.value.trim().length == 0) {
      return true;
    }
    const normalizedLabel = normalizeString(node.label || '');
    return normalizedLabel.includes(normalizedSearchTerm);
  }
  );
});
// //FIXME:CHECKBOX only
watch([treeOptions, () => props.userIds], ([newValue, newUserIds], [oldValue, oldUserIds]) => {
  if (props.selectionMode === 'checkbox') {
    if (!isEqual(newUserIds, oldUserIds) || !isEqual(newValue, oldValue)) {
      selectedUserIds.value = rebuildTreeCheckBox(newUserIds, newValue);
    }
  } else {
    if (!isEqual(newUserIds, oldUserIds) || !isEqual(newValue, oldValue)) {
      const rs: Record<string, true> = {};
      newUserIds.forEach(e => rs[e] = true);
      selectedUserIds.value = rs;
    }

  }

}, { immediate: true, });
// watch(()=>props.userIds, (userIds, oldUserIds)=>{
//   if (props.selectionMode === 'checkbox') {
//     const diff = difference(oldUserIds, userIds);
//
//     if (diff.length != 0 ) {
//       diff.forEach(e=>unselectNodeByKey(e));
//     } else {
//       console.log('No change detected');
//     }
//   }
// });

function updateMapIdName(key: string, label?: string) {
  // mapIdName.value = {
  //   ...mapIdName.value,
  //   [key]: label || ''
  // };
}

function removeFromMapIdName(key: string) {
  // const { [key]: _, ...remainingEntries } = mapIdName.value;
  // mapIdName.value = remainingEntries;
}

function nodeSelectHandle(node: TreeNode) {
  if (props.selectionMode != 'checkbox') {
    updateMapIdName(node.key || '', node.label);
  }
}

function nodeUnselectHandle(node: TreeNode) {
  if (props.selectionMode != 'checkbox') {
    removeFromMapIdName(node.key || '');
  }
}

</script>

<style scoped>

</style>