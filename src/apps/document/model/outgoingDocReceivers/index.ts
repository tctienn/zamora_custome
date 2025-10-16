export interface OutgoingDocReceivers {
    id: string,
    objectId: string,
    objectName: string,
    docId: string,
    objectType: ReceiveObjectType,
    receiveType: ReceiveType,
    orderNo: number,
    receiveStatus: ReceiveStatus,
    receiveTime: Date,
    isDeleted: boolean,
    roleId?: string,
    roleName?: string,
    deptId?: string,
    deptName?: string
}

export enum ReceiveObjectType {
    NGUOI_NHAN_TRONG_HE_THONG = 'NGUOI_NHAN_TRONG_HE_THONG',
    DON_VI_NOI_BO = 'DON_VI_NOI_BO',
    DON_VI_NGOAI = 'DON_VI_NGOAI'
}

export enum ReceiveType {
    GUI_TRUC_TIEP_TREN_HE_THONG = 'GUI_TRUC_TIEP_TREN_HE_THONG',
    NHAN_GIAY = 'NHAN_GIAY',
    QUA_TRUC_QUOC_GIA = 'QUA_TRUC_QUOC_GIA'
}

export enum ReceiveStatus {
    CHUA_NHAN = 'CHUA_NHAN',
    DA_NHAN = 'DA_NHAN'
}