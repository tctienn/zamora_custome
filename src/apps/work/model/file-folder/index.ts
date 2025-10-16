import { User } from '@/common/model/User';

export interface EcmFileFolder {
    id: string,
    name: string,
    treePath: string,
    isHidden: boolean,
    personal: boolean,
    tags: string[],
    isImportant: boolean,
    isShare: boolean,
    isDeleted: boolean,
    createdAt: Date,
    createdBy: string,
    lastModifiedAt: Date,
    lastModifiedBy: string,
}

export interface EcmFile extends EcmFileFolder {
    folderId: string,
    extension: string,
    size: number,
}

export interface EcmFolder extends EcmFileFolder {
    parentId: string;
}

export interface EcmTag {
    id?: string,
    name: string,
    icon: string,
    color: string
}

export interface EcmSharedFileFolder {
    fileFolderId: string,
    isFolder: boolean,
    fromUser: string,
    toUser: EcmSharedToUser[],
    fromGroup: string,
    toGroup: EcmSharedToGroup[],
    sharedAt: Date
}

export interface EcmSharedToUser {
    userId: string,
    permissions: string[]
}

export interface EcmSharedToGroup {
    groupId: string,
    permissions: string[]
}

export type FolderTree = {
    id: string
    name: string
    parentId: string
    treePath: string
    children: FolderTree[]
}

export type VcsHistory = {
    user: User,
    action: string,
    time: string,
    md5: string,
    version: string
}