export type TaskLabelInput = {
    id: string,
    taskId: string,
    labelId: string,
    labelTitle: string,
    labelColor: string,
}

export type LabelInput = {
    id: string,
    labelTitle: string,
    labelColor: string,
}

export interface Label {
    id: string,
    labelTitle: string,
    labelColor: string
}