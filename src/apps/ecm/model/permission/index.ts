import type { UserMoreInfo } from '@/apps/admin/model/User';

export type FileFolderPermission = {
  id: PermissionId
  permission: string
  info?: UserMoreInfo
}

type PermissionId = {
  groupId: string
  userId: string
  path: string
}