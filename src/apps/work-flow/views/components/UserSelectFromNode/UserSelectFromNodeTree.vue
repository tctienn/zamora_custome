<template>
  <TreeSelect
    v-bind='$attrs'
    v-model='selectedUserIds'
    display='chip'
    :options='treeOptions'
    :selection-mode='selectionMode'>
    <template #value='{ value, placeholder }'>
      <div v-if='value.length === 0'>
        {{ placeholder }}
      </div>
      <div class='flex'>
        <div
          v-for='v in value'
          :key='v.key'>
          <Chip
            class='mx-1'
            :label='v.label'/>
        </div>
      </div>
    </template>

  </TreeSelect>
</template>

<script lang="ts" setup>
import { get, groupBy } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getAllOrganizationGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import { getAllUserOrganization } from '@/apps/document/api/graphql/userOrganization';
import { OrganizationType } from '@/apps/document/model/organization';
import type { BasicNode, OrgRole } from '@/apps/work-flow/model/flow';
import { filterTreeNodes } from '@/common/helpers/tree-node-utils';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox' | undefined>,
    default: undefined,
  },
  node: {
    type: Object as PropType<BasicNode>,
    default: undefined,
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => [],
  },
  removeEmptyDep: {
    type: Boolean,
    default: false
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    default: OrganizationType.PARTY
  }
});

// Initialize internationalization
const { t } = useI18n();

// State management
const selectedUserIds = ref<Record<string, true>>({});
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
const { onResult: orgOnResult, result: resultParty } = getAllOrg();
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
</script>

<style scoped>
/* Add your styles here */
</style>
