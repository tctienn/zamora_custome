import { get } from 'lodash';
import type { TreeNode } from 'primevue/treenode';
import { computed, onMounted, type Ref, toRef } from 'vue';

import { getAllOrganizationPublicGraphql } from '@/apps/admin/api/graphql/organization-graphql-api';
import type { OrganizationInterface } from '@/apps/admin/model/organization';
import { getByTypeGraphql } from '@/apps/document/api/graphql/organization';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';
import { associateBy } from '@/common/helpers/extension/array.extension';
import { listToTree } from '@/common/helpers/utils';

export function useOrganizationByType<T extends UserDeptRoleInput>(
  orgType: OrganizationType,
  userDeptRoles: Ref<T[]> = toRef([]),
  skipUser: (user: T) => boolean = () => false
) {

  const treeNode = computed<TreeNode[]>(() => constructTree().value);
  const noDeptId = Date.now().toString();
  const orgUserMap = computed(() => {
    const map: { [orgCode: string]: TreeNode[] } = {};
    userDeptRoles.value.forEach((user) => {
      if (!user.userId) {
        return;
      }

      if (skipUser(user)) {
        return;
      }

      const userNode: TreeNode = {
        key: `${user.userId}_${user.roleId}`,
        label: user.userName,
        data: {
          ...user,
          type: 'user'
        },
      };

      const deptKey = user.deptId || noDeptId;
      map[deptKey] = [...map[deptKey] || [], userNode];
    });
    return map;
  });
  const resultAdmin = toRef(undefined);
  const resultParty = toRef(undefined);

  onMounted(() => {
    if (orgType == OrganizationType.ADMINISTRATIVE && resultAdmin.value == undefined) {
      getAllOrganizationPublicGraphql().onResult(res => {
        resultAdmin.value = res.data;
      });
    } else if (orgType == OrganizationType.ADMINISTRATIVE && resultParty.value == undefined) {
      getByTypeGraphql(orgType).onResult(res => {
        resultParty.value = res.data;
      });
    }
  });
  const allOrg = computed(
    () => {
      if (orgType == OrganizationType.ADMINISTRATIVE) {
        return get(resultAdmin.value, 'allOrganizationPublic', []) as OrganizationInterface[];
      } else {
        return get(resultParty.value, 'getByType', []) as OrganizationInterface[];
      }
    }
  );
  const allOrgMap = computed(() => {
    return associateBy(allOrg.value, item => item.id);
  });

  function updateUserKeys(node: any, parentKey = ''): Node {
    if (node.data?.type === 'user') {
      node.key = `${parentKey}_${node.key}`;
    }
    if (node.children && node.children.length > 0) {
      node.children = node.children.map((child: any) => updateUserKeys(child, node.id));
    }
    return node;
  }

  function constructTree() {
    return computed<TreeNode[]>(() => {
      const treeNodes = allOrg.value.map((org) => ({
        key: `org_${org.id}`,
        id: `org_${org.code}`,
        label: org.name,
        data: {
          ...org,
          fullName: org.name,
          type: 'dept',
        },
        parentId: org.parentCode ? `org_${org.parentCode}` : 'org_', // Đảm bảo parentId không null
        children: orgUserMap.value[org.id] || [],
      }));

      // Chuyển đổi danh sách thành cây
      const tree = listToTree(treeNodes, {
        id: 'id',
        parentId: 'parentId',
        children: 'children',
      });

      // Cập nhật key cho user nodes trong cây
      return tree.map((rootNode: any) => updateUserKeys(rootNode));
    });
  }

  function filterDuplicatesInTreeArray(nodes: TreeNode[]): TreeNode[] {
    const seenKeys = new Set<string>();

    function filterNode(node: TreeNode): TreeNode | null {
      if (seenKeys.has(node.key || '')) {
        return null;
      }

      seenKeys.add(node.key || '');

      if (node.children) {
        node.children = node.children
          .map((child) => filterNode(child))
          .filter((child): child is TreeNode => child !== null);
      }

      return node;
    }

    return nodes
      .map((node) => filterNode(node))
      .filter((node): node is TreeNode => node !== null);
  }

  return {
    allOrg,
    treeNode,
    orgUserMap,
    allOrgMap,
  };
}
