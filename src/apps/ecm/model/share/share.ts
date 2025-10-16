export type ShareInfo = {
    avatar: string,
    sharedUserId: string,
    type: string,
    defaultPermission: string,
    sharedUsers: SharedUser[],

    path?: string
}

export type SharedUser = {
    userId: string,
    fullName: string,
    permission: string
    email: string
}

export type ShareInfoInput = {
    fileFolderId: string,
    isFolder: boolean,
    type: string,
    defaultPermission: string,
    sharedUsers: SharedUser[]
}