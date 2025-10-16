import type { TaskComment } from '@/apps/work/model/taskComment';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function createTaskComment(formData: FormData) {
  return baseApi.postWithFile<TaskComment>(`${WORK_URL}/comment/add-comment`, formData);
}

export function deleteTaskComment(commentId: string) {
  return baseApi.del<TaskComment>(`${WORK_URL}/comment/delete/${commentId}`, {});
}

export function editTaskComment(commentId: string, formData: FormData) {
  return baseApi.putWithFile<TaskComment>(`${WORK_URL}/comment/edit/${commentId}`, formData);
}

export function readTaskComment(taskId: string) {
  return baseApi.get<boolean>(`${WORK_URL}/comment/read`, { params: { taskId: taskId } });
}

