import { cancelWork, deleteWork, resumeWork, startWork } from '@/apps/work-flow/api/graphql/work';
import { WorkStatus } from '@/apps/work-flow/model/process/work';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import router from '@/common/router';

export const actionsMapping: { [key: string]: string[] } = {
  'start': [WorkStatus.CREATED],
  'view': Object.values(WorkStatus),
  'cancel': [WorkStatus.IN_PROGRESS],
  'resume': [WorkStatus.CANCELLED],
  'delete': [WorkStatus.CREATED, WorkStatus.CANCELLED, WorkStatus.COMPLETED]
};

export function getActions(status?: WorkStatus): string[] {
  if (status === undefined) {
    return Object.keys(actionsMapping);
  }
  return Object.keys(actionsMapping).filter((s) => actionsMapping[s].includes(status));
}

export function viewDetail(id: string) {
  return router.push({
    name: 'WorkFlowProcessWorkDetail',
    params: { id }
  });
}

export async function startWorkFlow(id: string): Promise<void> {
  await startWork().mutate({ id });
  toastSuccess();
}

export async function cancelWorkFlow(id: string) {
  await cancelWork().mutate({ id });
  toastSuccess();
}

export async function resumeWorkFlow(id: string) {
  await resumeWork().mutate({ id });
  toastSuccess();
}

export async function deleteWorkFlow(id: string) {
  await deleteWork().mutate({ id });
  toastSuccess();
}