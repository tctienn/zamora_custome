import type { ProjectDiscussionInterface } from '@/apps/work/model/projectDiscussion';
import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { Pageable } from '@/common/model/query';

export function createProjectDiscussion(formData: FormData) {
  return baseApi.postWithFile<ProjectDiscussionInterface>(`${WORK_URL}/project-discussions`, formData);
}

export function updateProjectDiscussion(formData: FormData, id: string) {
  return baseApi.putWithFile<ProjectDiscussionInterface>(`${WORK_URL}/project-discussions/${id}`, formData);
}

export function getDiscussionByProjectId(objectId: string, commentId: string, pageable: Pageable) {
  return baseApi.get<ProjectDiscussionInterface[]>(`${WORK_URL}/project-discussions/${objectId}`, {
    params: {
      commentId: commentId,
      ...pageable
    }
  },);
}

export function deleteComment(commentId: string) {
  return baseApi.del(`${WORK_URL}/project-discussions`, { commentId: commentId }, { params: { commentId: commentId } });
}

export function uploadFiles(projectId: string, formData: FormData) {
  return baseApi.postWithFile(`${WORK_URL}/project-discussions/${projectId}/upload-files`, formData);
}

export function sendMessage(formData: FormData) {
  return baseApi.postWithFile(`${WORK_URL}/project-discussions/sendMessage`, formData);
}

export function deleteProjectMessage(commentId: string) {
  return baseApi.del<ProjectDiscussionInterface>(`${WORK_URL}/project-discussions/delete/${commentId}`, {});
}

export function editProjectMessage(commentId: string, formData: FormData) {
  return baseApi.putWithFile<ProjectDiscussionInterface>(`${WORK_URL}/project-discussions/edit/${commentId}`, formData);
}

export function readProjectMessage(projectId: string) {
  return baseApi.get<boolean>(`${WORK_URL}/project-discussions/read`, { params: { projectId: projectId } });
}