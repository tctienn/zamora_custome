type OrganizationBase = {
    id: string;
    name: string;
    type: OrganizationType;
    isDeleted: boolean;
    isActive: boolean;
    norder: number;
    code: string;
    description: string;

    createdTime: Date;
    createdBy: string;
    lastModifiedTime: Date;
    lastModifiedBy: string;
};

export type OrganizationInterface = OrganizationBase & {
    parentId: string;
    tags: string[]
};

export type OrganizationInput = OrganizationBase & {
    parentId: { [key: string]: boolean };
};

export interface UserInOrganizationInterface {
    id: string;
    userId: string;
    username: string;
    email: string;
    fullName: string;
    gender: string;
    isConcurrently?: boolean;
    position?: string;
    phone: string;
    birthDay: Date;
    createDate: Date;
    createdDateOfUser: Date;
    role: string;
}

export type UserOrganization = {
    id?: string;
    organizationId: string;
    userId: string;
    isDeleted?: boolean;
    position?: string;
    isConcurrently?: boolean;
    phone?: string;
    email?: string;
    createdDateOfUser?: string;
    birthDay?: string;
    role: string;
    roleName: string;

};

export enum OrganizationType {
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    UNION = 'UNION',
    PARTY = 'PARTY',
}
