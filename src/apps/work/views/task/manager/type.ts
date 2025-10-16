import { TaskRoleFilter } from '@/apps/work/model/task';

export type ButtonModelType = {
  label: string,
  count?: number,
  code: TaskRoleFilter,
  command?: () => void,
  [key: string]: any,
}

export type ViewType = 'list' | 'kanban' | 'hierarchy' | 'calendar' | 'gantt' | 'groupByProject' | 'groupByGroupTask';
