export type TaskResultInput = {
    id: string,
    taskId?: string,
    weight: number,
    percent: number,
    statusId: string,
    statusName?: string,
    description: string,
}