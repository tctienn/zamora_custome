export type CapacityConfig = {
    id?: string
    type: string
    capacity: number
    unit: string
    objectId: string
}

export interface CapacityConfigEdge {
    cursor: string;
    node: CapacityConfig | null;
}

export enum unitCapacity {
    MB = 'MB',
    GB = 'GB',
    TB = 'TB'
}

export enum typeConfigCapacity {
    GROUP = 'GROUP',
    PERSON = 'PERSON'
}