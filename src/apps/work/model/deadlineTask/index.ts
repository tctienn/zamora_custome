export type TaskDeadlineInput = {
    id: string
    reason: string,
    taskId: string,
    oldDeadline: Date | null,
    isCurrent: boolean,
    newDeadline: Date | null,
    oldStart: Date | null,
    newStart: Date | null,
}