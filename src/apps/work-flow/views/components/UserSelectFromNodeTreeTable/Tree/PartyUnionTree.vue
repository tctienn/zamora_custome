<template>
  <CommonTree
    v-model:chosen-user-dept-role='chosenUserDeptRole'
    :selection-mode='selectionMode'
    :should-show-checkbox='shouldShowCheckbox'
    style='height: 64vh'
    :tree-options='orgUserOptions'></CommonTree>
</template>

<script lang="ts" setup>
import { get, groupBy } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed, type ComputedRef, onMounted, type PropType, ref } from 'vue';

import type { UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getListClericalChargedByOrgType } from '@/apps/document/api/graphql/clerical-charged';
import { getAllOrg } from '@/apps/document/api/graphql/organization';
import { getAllUserOrganization } from '@/apps/document/api/graphql/userOrganization';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { type OrganizationInterface, OrganizationType, type UserOrganization, } from '@/apps/document/model/organization';
import { roleName, RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import type { BasicNodeData, NodeInputInterface, } from '@/apps/work-flow/model/flow';
import CommonTree from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/CommonTree.vue';
import {
  getRolesByOrgId,
  isExistOrgId,
} from '@/apps/work-flow/views/components/UserSelectFromNodeTreeTable/Tree/orgUtils';
import { filterTreeNodes } from '@/common/helpers/tree-node-utils';
import { listToTree } from '@/common/helpers/utils';

const props = defineProps({
  selectionMode: {
    type: String as PropType<'single' | 'multiple' | 'checkbox' | undefined>,
    default: undefined,
  },
  users: {
    type: Array as PropType<UserMoreInfo[]>,
    default: () => [],
  },
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined,
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    default: OrganizationType.PARTY,
  },
  removeEmptyDep: {
    type: Boolean,
    default: false,
  },
  showUsersFromDifferentDept: {
    type: Boolean,
    default: false
  },
  shouldShowCheckbox: {
    type: Function as PropType<(node: TreeNode) => boolean>,
    default: () => true, // Example default function accepting a parameter
  },
});
const chosenUserDeptRole = defineModel<
    (UserDeptRoleInput & {
      id: string;
      action: 'main' | 'cooperative' | 'receiveToKnow' | undefined;
    })[]
      >('chosenUserDeptRole', { default: [] });
const { usersMoreInfo } = storeToRefs(useUserMoreInfoStore());

const allOrg = ref<OrganizationInterface[]>([]);
const listUser = ref<UserOrganization[]>([]);
const { result: listClerkResult } = getListClericalChargedByOrgType(props.orgType);
const listClerk = computed<(UserOrganization & { __typename: string })[]>(() => {
  return (listClerkResult.value?.getListClericalChargedByOrgType || []).map((e: any): UserOrganization & {
    __typename: string
  } => ({
    __typename: 'UserOrganizationData',
    id: e.id,
    role: RoleType.VAN_THU,
    roleName: roleName[RoleType.VAN_THU],
    userId: e.userId,
    organizationId: e.deptId,
  }));
});
const partyRootNode = computed(() => {
  const groupByTypeAllOrg = groupBy(allOrg.value, (value) => value.type);

  const result: { [orgId: string]: TreeNode[] } = {};
  [...listUser.value, ...listClerk.value].forEach((user: UserOrganization) => {
    if (!props.showUsersFromDifferentDept) {
      if (user.organizationId !== userDeptRole.value.deptId) {
        return;
      }
    }
    const orgRole = getRolesByOrgId(user.organizationId, orgRoles.value);
    if (
      (orgIdFiltered.value.length == 0
        ? true
        : orgIdFiltered.value.includes(user.organizationId))
        && (!nodeData.value?.options
            || userIds.value?.includes(user.userId)
            || isExistOrgId(user.organizationId, orgRoles.value)
            && (orgRole.length === 0 || orgRole.includes(user.role)))
    ) {
      const userNode: TreeNode = {
        key: user.userId + '_' + user.role,
        label: usersMoreInfo.value?.[user.userId]?.fullName,
        data: user,
      };
      result[user.organizationId] = [
        ...result[user.organizationId] || [],
        userNode,
      ];
    }
  });

  return listToTree(
    (groupByTypeAllOrg?.[props.orgType] || []).map((organization) => ({
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
    },
  );
});
const nodeData = computed(() => props.node?.data as BasicNodeData);
// const orgType = ref<OrganizationType>(nodeData?.orgType || OrganizationType.ADMINISTRATIVE);
const orgRoles = computed(() => nodeData.value?.options?.orgRoles || []);
const orgIdFiltered: ComputedRef<(string | null)[]> = computed(() => {
  return orgRoles.value.map((e) => e.orgId);
});
const userIds = computed(() => nodeData.value?.options?.userIds || []);
onMounted(() => {
  return getResult();
});
const orgUserOptions = computed(() => {
  let tree = filterTreeNodes(partyRootNode.value || [], (node) => {
    return (
      node.data?.__typename !== 'Organization'
      || node.data?.__typename === 'Organization'
        && (orgIdFiltered.value.includes(node.data?.id)
          || node.children?.some((child) =>
            orgIdFiltered.value.includes(child.data?.id),
          ))
      || false
    );
  });
  // tree = filterTreeNodes(
  //   tree,
  //   (node) => node.data?.__typename !== 'UserOrganizationData',
  //   ['org_' + userDeptRole.value.deptId],
  // );
  if (props.removeEmptyDep) {
    return filterTreeNodes(
      tree,
      (node) =>
        (node?.children?.length || -1) < 0
          && node.data?.__typename === 'UserOrganizationData',
    );
  }
  return tree;
});

function getResult() {
  getAllOrg().onResult((allOrgResult) => {
    allOrg.value = get(allOrgResult, 'data.getAll', []);
  });
  getAllUserOrganization().onResult((param1) => {
    listUser.value = get(param1, 'data.getAllUserOrganization', []);
  });
}

const { userDeptRole } = storeToRefs(useDocumentRolesStore());
</script>

<style scoped></style>
