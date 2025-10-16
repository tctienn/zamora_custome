export interface SignHistory {
    id: string
    attachmentId: string
    signerId: string
    signerName: string
    signerRoleId: string
    signerRoleName: string
    signerDeptId: string
    signerDeptName: string
    signType: SignTypeForDocSubmit
}

export enum SignTypeForDocSubmit {
    KY_SO = 'KY_SO', KY_DIEN_TU = 'KY_DIEN_TU'
}