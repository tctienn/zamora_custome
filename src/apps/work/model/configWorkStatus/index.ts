export interface TaskStatus {
  id: string,
  description: string,
  type: StatusType | null,
  color: string,
  name: string,
  orderNo: number | null
}

export interface TaskStatusCount extends TaskStatus {
  count: number;
}

export class ConfigWorkStatus implements TaskStatus {
  id: string;

  description: string;

  type: StatusType | null;

  color: string;

  name: string;

  orderNo: number | null;

  constructor() {
    this.id = '';
    this.description = '';
    this.type = StatusType.START;
    this.color = '';
    this.name = '';
    this.orderNo = null;
  }
}

export interface ConfigWorkStatusEdge {
  cursor: string;
  node: TaskStatus | null;
}

export enum StatusType {
  START = 'START', IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED', CANCELED = 'CANCELED', STOPPED = 'STOPPED'
}