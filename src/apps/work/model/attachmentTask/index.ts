export interface AttachmentInterface {
    id: string
    name: string
    extension: string
    path: string
    size: number
    taskId: string
    orderNo: number
    objectType: string
    objectId: string
    taskName: string
    createdTime: Date
    createdBy: string
    createdName: string
    lastModifiedTime: Date
    lastModifiedBy: string
    lastModifiedName: string
}

export interface AttachmentEdge {
    cursor: string
    node: AttachmentInterface | null
}