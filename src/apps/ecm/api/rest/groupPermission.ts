import type { GroupPermission } from '@/apps/ecm/store/ecm_group_permissions';
import { ECM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function userPermissions(groupId: string) {
  return baseApi.get<GroupPermission[]>(`${ECM_URL}/group/permission/userPermission?groupId=${groupId}`);
}

export function addUserToUserGroup(data: any) {
  return baseApi.post<GroupPermission[]>(`${ECM_URL}/group/addUserToUserGroup`, data);
}