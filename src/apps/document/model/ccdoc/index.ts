export interface CcdocInterface {
    ccInfoModels: CCInfoModelInterface[],
    userDeptRole: UserDeptRoleModelInterface
}

export interface CCInfoModelInterface {
    id?: string,
    docId: string,
    receiverId: string,
    receiverRoleId: string,
    receiverDeptId: string,
    receiverName: string,
    receiverRoleName: string,
    receiverDeptName: string,
}

export interface UserDeptRoleModelInterface {
    userId: string,
    userName: string,
    deptId: string,
    deptName: string,
    roleId: string,
    roleName: string
}

export type CCInfo = {
    id?: string
    docId?: string
    senderId?: string
    senderRoleId?: string
    senderDeptId?: string
    sendTime?: string
    receiverId?: string
    receiverRoleId?: string
    receiverDeptId?: string
    senderName?: string
    senderRoleName?: string
    senderDeptName?: string
    receiverName?: string
    receiverRoleName?: string
    receiverDeptName?: string
    isRead?: boolean
    readTime?: string
    isDeleted?: boolean
}
