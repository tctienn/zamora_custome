import { completeTask } from '@/apps/work-flow/api/graphql/task';
import { toastSuccess } from '@/common/helpers/custom-toast-service';
import router from '@/common/router';

export function viewDetail(id: string) {
  return router.push({
    name: 'WorkFlowProcessTaskDetail',
    params: { id }
  });
}

export async function handleCompleteTask(id: string, result: string, comment?: string) {
  await completeTask().mutate({
    id,
    result,
    comment
  });
  return toastSuccess();
}