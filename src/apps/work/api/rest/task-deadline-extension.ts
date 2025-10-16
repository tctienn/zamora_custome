import type { TaskDeadlineExtension } from '@/apps/work/model/taskDeadlineExtension';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function addTaskDeadlineExtension(formData: FormData) {
  return baseApi.postWithFile<TaskDeadlineExtension>(`${WORK_URL}/task/task-deadline-extension`, formData);
}

export function updateTaskDeadlineExtension(id: string, formData: FormData) {
  return baseApi.putWithFile<TaskDeadlineExtension>(`${WORK_URL}/task/task-deadline-extension/${id}`, formData);
}

export function getTaskDeadlineExtension(id: string) {
  return baseApi.get<TaskDeadlineExtension>(`${WORK_URL}/task/task-deadline-extension/${id}`);
}

export function deleteTaskDeadlineExtension(id: string) {
  return baseApi.del(`${WORK_URL}/task/task-deadline-extension/${id}`, undefined);
}