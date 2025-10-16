export interface LogAction {
    id: string,
    userId: string,
    userName: string,
    email: string,
    fullName: string,
    time: string,
    ip: string,
    module: string,
    function: string,
    objectName: string,
    action: string,
}

export interface LogEdge {
    cursor: string
    node: LogAction | null
}
