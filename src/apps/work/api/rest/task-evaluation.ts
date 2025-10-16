import type { TaskComment } from '@/apps/work/model/taskComment';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function addEvaluation(formData: FormData) {
  return baseApi.postWithFile<TaskComment>(`${WORK_URL}/task/evaluation`, formData);
}