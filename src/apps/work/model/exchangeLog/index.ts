export type Comment = {
    id: string,
    content: string,
    replyId: string,
    type: CommentType,
    objectId: string
}

export enum CommentType {
    TASK, PROJECT
}

export type CommentEdge = {
    cursor?: string
    node: Comment
}