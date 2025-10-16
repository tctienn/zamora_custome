import type { TaskStatus } from '@/apps/work/model/configWorkStatus';
import { StatusType } from '@/apps/work/model/configWorkStatus';
import type { Task } from '@/apps/work/model/task';

export type Board = {
  columns: Column[]
}

export type Column = {
  id: string
  title: string
  order: number
  color: string,
  type: StatusType,
  listTask: Task[]
}

export enum BoardType {
  PERSON, PROJECT, PERSON_WORKSPACE, GROUP_WORKSPACE
}

export function generateBoardFromStatus(status: TaskStatus[]): Board {
  return {
    columns: status.map(s => {
      return {
        id: s.id,
        title: s.name,
        order: getStatusOrder(s),
        color: s.color,
        type: s.type as StatusType,
        listTask: []
      };
    }).sort((a, b) => a.order - b.order)
  };
}

function getStatusOrder(s: TaskStatus): number {
  switch (s.type) {
  case StatusType.START:
    return 0;
  case StatusType.CANCELED:
    return 100;
  case StatusType.COMPLETED:
    return 1000;
  default:
    return s.orderNo || 1;
  }
}