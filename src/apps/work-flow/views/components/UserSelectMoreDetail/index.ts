import type { TreeNode } from 'primevue/treenode';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';

export function extractTreeNode(node: TreeNode): UserDeptRoleInput & { id: string } {
  const rs: UserDeptRoleInput & { id: string } = {} as UserDeptRoleInput & { id: string };
  const data = node?.data;
  if (!data) {
    return rs;
  }

  const { __typename, id, name, userId, userName, organizationId, role, roleName, deptId, deptName, roleId } = data;

  switch (__typename) {
  case 'Organization':
    rs.deptId = id;
    rs.deptName = name;
    break;

  case 'UserOrganizationData':
    rs.userId = userId;
    rs.userName = userName;
    rs.deptId = organizationId;
    rs.deptName = deptName;
    rs.roleId = role;
    rs.roleName = roleName;
    break;

  default:
    rs.userId = userId;
    rs.userName = userName;
    rs.deptId = deptId;
    rs.deptName = deptName;
    rs.roleId = roleId;
    rs.roleName = roleName;
    break;
  }

  rs.id = node.key || '';
  return rs;
}
