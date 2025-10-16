import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function permissionsByTask(taskId: string) {
  return baseApi.get<string[]>(`${ WORK_URL }/task/permission/byTask?taskId=${ taskId }`);
}