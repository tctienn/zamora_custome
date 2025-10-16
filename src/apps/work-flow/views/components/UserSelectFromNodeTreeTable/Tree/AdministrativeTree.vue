<template>
  <CommonTree
    v-model:chosen-user-dept-role='chosenUserDeptRole'
    :selection-mode='selectionMode'
    :should-show-checkbox='shouldShowCheckbox'
    style='height: 64vh'
    :tree-options='orgUserOptions'></CommonTree>
</template>

<script lang="ts" setup>
import { get } from 'lodash';
import { storeToRefs } from 'pinia';
import type { TreeNode } from 'primevue/treenode';
import { computed, type ComputedRef, type PropType } from 'vue';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import { getAllRolesPublic } from '@/apps/admin/api/graphql/role-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import type { Department, UserMoreInfo } from '@/apps/admin/model/User';
import { useUserMoreInfoStore } from '@/apps/admin/store/usersMoreInfo';
import { getListClericalChargedByOrgType } from '@/apps/document/api/graphql/clerical-charged';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { roleName, RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import type { BasicNodeData, NodeInputInterface, OrgRole, } from '@/apps/work-flow/model/flow';
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
  node: {
    type: Object as PropType<NodeInputInterface>,
    default: undefined,
  },
  orgType: {
    type: String as PropType<OrganizationType>,
    required: true,
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
const { usersMoreInfo, allUsers } = storeToRefs(useUserMoreInfoStore());
const chosenUserDeptRole = defineModel<
    (UserDeptRoleInput & {
      id: string;
      action: 'main' | 'cooperative' | 'receiveToKnow' | undefined;
    })[]
      >('chosenUserDeptRole', { default: [] });
const nodeData = computed(() => props.node?.data as BasicNodeData);
// const orgType = ref<OrganizationType>(nodeData?.orgType || OrganizationType.ADMINISTRATIVE);
const orgRoles = computed<OrgRole[]>(
  () => nodeData.value?.options?.orgRoles || [],
);
const userDeptRoles = computed<UserDeptRoleInput[]>(() => nodeData.value?.options?.userDeptRoles || []);
const orgIdFiltered: ComputedRef<(string | null)[]> = computed(() => {
  return orgRoles.value.map((e) => e.orgId);
});
const userIds = computed(() => nodeData.value?.options?.userIds || []);
const noDepId = Date.now();
const { result: listClerkResult } = getListClericalChargedByOrgType(OrganizationType.ADMINISTRATIVE);
const listClerk = computed<(UserDeptRoleInput & { __typename: string })[]>(() => {
  return (listClerkResult.value?.getListClericalChargedByOrgType || []).map((e: any): UserDeptRoleInput & {
    __typename: string
  } => ({
    __typename: 'UserMoreInfo',
    roleId: RoleType.VAN_THU,
    roleName: roleName[RoleType.VAN_THU],
    type: OrganizationType.ADMINISTRATIVE,
    userId: e.userId,
    userName: usersMoreInfo.value[e.userId].fullName,
    deptId: e.deptId,
    deptName: usersMoreInfo.value[e.userId].departments?.[0]?.name || '',
  }));
});
const transformUserMoreInfo = computed(() => {
  const rs: Array<UserDeptRoleInput & { __typename: string }> = [];
  allUsers.value.forEach((u: UserMoreInfo) => {
    u.roles?.forEach((role) => {
      u.departments?.forEach((dep: Department) => {
        {
          rs.push({
            __typename: 'UserMoreInfo',
            userId: u.id,
            roleName: mapRoleName.value.get(role) || '',
            userName: u.fullName,
            deptName: dep.name,
            deptId: dep.id || '',
            roleId: role,
            type: OrganizationType.ADMINISTRATIVE,
          });
        }
      });
    });
  });
  return [...rs, ...listClerk.value];
});

const orgUserMap = computed(() => {
  const map: { [orgCode: string]: TreeNode[] } = {};
  transformUserMoreInfo.value.forEach((user) => {
    if (!props.showUsersFromDifferentDept) {
      if (user.deptId !== userDeptRole.value.deptId) {
        return;
      }
    }
    // const orgRole = getRolesByOrgId(user.deptId, orgRoles.value);
    if (
      checkUser(user)
    // (orgIdFiltered.value.length == 0
    //   ? true
    //   : orgIdFiltered.value.includes(user.deptId))
    //   && (!nodeData.value?.options
    //       || userIds.value?.includes(user.userId)
    //       || isExistOrgId(user.deptId, orgRoles.value)
    //       && (orgRole.length === 0 || orgRole.includes(user.roleId)))

    ) {
      const userNode: TreeNode = {
        key: user.userId + '_' + user.roleId,
        label: user.userName,
        data: {
          ...user,
          userId: user.userId,
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

const { result: resultAdmin } = getAllOrganizationPublicGraphql();
const allOrg = computed(
  () =>
      get(
        resultAdmin.value,
        'allOrganizationPublic',
        [],
      ) as OrganizationInterface[],
);

const orgUserOptions: ComputedRef<TreeNode[]> = computed(() => {
  // const rootNode: TreeNode = {
  //   key: 'org_',
  //   label: t('work-flow.task.orgTree'),
  //   data: {
  //     code: 'org_',
  //     fullName: t('work-flow.task.orgTree')
  //   },
  // };

  const treeNodes = allOrg.value.map((org) => ({
    key: `org_${org.id}`,
    id: `org_${org.code}`,
    label: org.name,
    data: {
      ...org,
      fullName: org.name,
    },
    type: 'custom',
    parentId: `org_${org.parentCode}`,
    children: orgUserMap.value[org.id],
  }));
  let tree: TreeNode[] = listToTree(treeNodes, {
    id: 'id',
    parentId: 'parentId',
    children: 'children',
  });
  tree = filterTreeNodes(tree, (node) => {
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
  //   (node) => node.data?.__typename !== 'UserMoreInfo',
  //   ['org_' + userDeptRole.value.deptId],
  // );

  if (props.removeEmptyDep) {
    tree = filterTreeNodes(
      tree,
      (node) =>
        (node?.children?.length || -1) < 0
          && node.data?.__typename === 'UserMoreInfo',
    );
  }

  // rootNode.children = [...tree, ...orgUserMap.value[noDepId] || []];
  return [...tree, ...orgUserMap.value[noDepId] || []];
});
const { userDeptRole } = storeToRefs(useDocumentRolesStore());
const { result } = getAllRolesPublic();
const mapRoleName = computed(() => {
  return new Map<string, string>(
    result?.value?.rolesPublic?.map((role: { code: string; name: string }) => [
      role.code,
      role.name,
    ]),
  );
});

function checkUserDeptRole(user: UserDeptRoleInput): boolean {
  return userIds.value.length == 0 && userDeptRoles.value.length == 0 && orgIdFiltered.value.length == 0
      || userDeptRoles.value.some(e => e.userId == user.userId && e.deptId == user.deptId && e.roleId == user.roleId);
}

function checkUserId(user: UserDeptRoleInput): boolean {
  return userIds.value.length == 0 && userDeptRoles.value.length == 0 && orgIdFiltered.value.length == 0 || userIds.value.includes(user.userId);
}

function checkOrgRole(user: UserDeptRoleInput): boolean {
  const orgRole = getRolesByOrgId(user.deptId, orgRoles.value);
  return userIds.value.length == 0 && userDeptRoles.value.length == 0 && orgIdFiltered.value.length == 0 || isExistOrgId(user.deptId, orgRoles.value)
      && (orgRole.length === 0 || orgRole.includes(user.roleId));
}

function checkUser(user: UserDeptRoleInput) {
  return !nodeData.value?.options || checkUserDeptRole(user) || checkUserId(user) || checkOrgRole(user);
}

</script>

<style scoped></style>
