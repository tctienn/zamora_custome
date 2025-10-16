import { StatusType, type TaskStatus } from '@/apps/work/model/configWorkStatus';
import type { Task } from '@/apps/work/model/task';

export function overdueClass(data: Task, mapStatuses: Record<string, TaskStatus>) {
  if (!data?.dueTime) {
    return '';
  } else {
    const now = new Date();
    const dueTime = new Date(data.dueTime);
    const taskStatusType = data.statusId ? mapStatuses[data.statusId]?.type : null;
    const checkStatusTypeSatisfied = taskStatusType == null || ![StatusType.CANCELED, StatusType.COMPLETED, StatusType.STOPPED].includes(taskStatusType);
    if (now > dueTime && checkStatusTypeSatisfied) {
      return 'background-expire-task';
    }
  }
  return '';
}