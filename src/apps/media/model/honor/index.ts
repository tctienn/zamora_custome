export type Viewed = {
    userId: string
    createdAt: string
}

export type IHonor = {
    id?: string;
    title: string;
    type: string;
    description: string;
    createdBy: string;
    createdDate: Date;
    status: string;
    isHighlight: boolean
    allowsDroppingExpressions: boolean
    allowsComment: boolean
    norder: number
    users: []
    style: string
    organizations: []
}

export interface HonorEdge {
    cursor: string;
    node: IHonor | null;
}