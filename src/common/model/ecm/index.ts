export enum EcmServiceType {
    PERSON, PERSON_RECENT, PERSON_TRASH, SHARED, GROUP, GROUP_TRASH, ADMIN_TRASH
}

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