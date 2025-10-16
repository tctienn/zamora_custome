import type { ProjectInterface } from '@/apps/work/views/project/model';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function createProject(formData: FormData) {
  return baseApi.postWithFile<ProjectInterface>(`${ WORK_URL }/project`, formData);
}
export function updateProject(formData: FormData, id:string) {
  return baseApi.putWithFile<ProjectInterface>(`${ WORK_URL }/project/${id}`, formData);
}