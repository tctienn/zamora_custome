import type { TreeNode } from 'primevue/treenode';

import type { OrganizationInterface } from '@/apps/admin/model/organization';

export function setOrdinalNumberTree(tree: TreeNode[] | undefined): TreeNode[] {
  return tree?.map((node, index) => {
    return setOrdinalNumberNode(node, index, null);
  }) || [];
}

function setOrdinalNumberNode(node: TreeNode, index: number, parentIndex: string | null): TreeNode {
  const newNode = {
    ...node,
    data: {
      ...node.data,
      ordinalNumber: `${parentIndex == null ? '' : `${parentIndex}.`}${(index + 1).toString()}`,
    },
  };
  const childNodes = newNode.children;
  newNode.children = childNodes?.map((value, index) => {
    return setOrdinalNumberNode(value, index, newNode.data.ordinalNumber);
  });
  return newNode;
}

export function sortTree(nodes: TreeNode[], orderField: string): TreeNode[] {
  if (nodes.length != 0 && nodes[0].data && Object.prototype.hasOwnProperty.call(nodes[0].data, orderField)) {
    nodes.sort((a, b) => a.data[orderField] - b.data[orderField]);
    nodes.forEach(node => {
      if ((node.children ?? []).length > 0) {
        sortTree(node.children ?? [], orderField);
      }
    });
  }
  return nodes || [];
}

export function wrapByRootNode(nodes: TreeNode[], root: TreeNode = {
  key: '',
  label: 'root',
}): TreeNode {
  root.children = nodes;
  return root;
}

export function findTreeNodeByKey(key: string, nodes: TreeNode[] | undefined): TreeNode | undefined {
  if (nodes) {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      const result = findTreeNodeByKey(key, node.children);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  }
  return undefined;
}

export function filterTreeNodes(
  nodes: TreeNode[],
  predicate: (node: TreeNode) => boolean,
  ignoreKeys?: string[]
): TreeNode[] {
  function filterNode(node: TreeNode): TreeNode | null {
    // Filter the children recursively
    if (node.key && ignoreKeys?.includes(node.key)) {
      return node;
    }
    const filteredChildren = node?.children
      ? node?.children
        .map(child => filterNode(child))
        .filter(child => child !== null) as TreeNode[]
      : [];

    // Apply the predicate to the current node
    if (predicate(node) || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }
    // If the node does not meet the predicate and has no valid children, return null
    return null;
  }

  return nodes
    .map(node => filterNode(node))
    .filter(node => node !== null) as TreeNode[];
}

export interface CheckStatus {
    [key: string]: {
        checked: boolean;
        partialChecked: boolean;
    };
}

export function rebuildOrgTree(orgIds: string[], listOrg: OrganizationInterface[]): CheckStatus {
  const rs = orgIds
    ?.reduce((acc, curr) => {
      acc[curr] = {
        checked: true,
        partialChecked: false
      };
      return acc;
    }, {} as CheckStatus);
  for (const key in rs) {
    const currOrg: OrganizationInterface | undefined = listOrg.find(e => e.code == key);
    if (currOrg && currOrg.parentCode && !rs[currOrg.parentCode]) {
      rs[currOrg.parentCode] = {
        checked: false,
        partialChecked: true
      };
    }
  }
  return rs;
}

export function getIdsFromChecked(checkStatus: CheckStatus) {
  const depCodes = [];
  for (const key in checkStatus) {
    const depObj = checkStatus[key];
    if (depObj.checked) {
      depCodes.push(key);
    }
  }
  return depCodes;
}

export function initSelectedOrg(selectionMode: 'single' | 'multiple' | 'checkbox', orgIds: string[], listOrg: OrganizationInterface[]) {
  switch (selectionMode) {
  case 'single':
  case 'multiple': {
    const rs: { [orgId: string]: boolean } = {};
    orgIds.forEach((e) => {
      rs[e] = true;
    });
    return rs;
  }
  case 'checkbox':
    return rebuildOrgTree(orgIds || [], listOrg);
  }
}

export function computeLabelDepartment(value: TreeNode[]) {
  const mapNode: Map<string, TreeNode> = new Map();
  const rs: TreeNode[] = [];
  if (!value) {
    return [];
  }
  for (const node of value) {
    mapNode.set(node.key || '', node);
    if (!mapNode.get(node.parentId)) {
      rs.push(node || {} as TreeNode);
    }
  }
  return rs;
}

export function rebuildTreeCheckBox(key: string[], nodes: TreeNode[]): CheckStatus {
  const rs: CheckStatus = {};

  key.forEach(e => {
    rs[e] = {
      checked: true,
      partialChecked: false
    };
  });

  function checkParentNode(node: TreeNode, checkStatus: CheckStatus) {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => checkParentNode(child, rs));
      const allChecked = node.children.every(child => checkStatus[child?.key || '']?.checked);
      const someChildrenChecked = node.children.some(child => checkStatus[child?.key || '']?.checked || checkStatus[child?.key || '']?.partialChecked);
      checkStatus[node?.key || ''] =
          {
            ...checkStatus[node?.key || ''],
            checked: allChecked,
            partialChecked: allChecked ? false : someChildrenChecked
          };
    }
  }

  nodes.forEach(node => {
    checkParentNode(node, rs);
  });
  return rs;
}

export function mapTreeNode<T>(treeNodes: TreeNode[], mapFunction: (node: TreeNode) => T): Array<T> {
  return treeNodes.map(node => {
    const mappedNode = mapFunction(node);

    if (node.children && node.children.length > 0) {
      return {
        ...mappedNode,
        children: mapTreeNode(node.children, mapFunction)
      };
    } else {
      return mappedNode;
    }
  });
}

export function mapTreeNodeToFlatList<T>(
  treeNodes: TreeNode[],
  mapFunction: (node: TreeNode) => T
): T[] {
  const result: T[] = [];

  function traverse(nodes: TreeNode[]) {
    nodes.forEach(node => {
      // Apply the mapFunction to the current node and add it to the result list
      result.push(mapFunction(node));

      // Recursively traverse children if they exist
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(treeNodes);
  return result;
}

export function hasAncestorWithId(node: TreeNode, targetId: string): boolean {
  function checkAncestors(nodes: TreeNode[]): boolean {
    for (const n of nodes) {
      if (n.id === targetId) {
        return true;
      }
      if (n.children && checkAncestors(n.children)) {
        return true;
      }
    }
    return false;
  }

  return checkAncestors([node]);
}