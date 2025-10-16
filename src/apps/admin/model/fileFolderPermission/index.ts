export interface CategoryInterface {
    code: PermissionId,
    permission: string,
}

interface PermissionId {
    groupId: string,
    userId: string,
    path: string
}