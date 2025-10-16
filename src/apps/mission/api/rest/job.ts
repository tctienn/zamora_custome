
import { MISSION_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

import type { JobAssignmentInput } from '../../model/job/job';

export function createJob(formData: FormData) {
  return baseApi.postWithFile<string>(`${ MISSION_URL }/job`, formData);
}

export function updateJob(formData: FormData, id:string) {
  return baseApi.putWithFile<string>(`${ MISSION_URL }/job/${id}`, formData);
}

export function submitJobAssignment(formData: FormData) {
  return baseApi.postWithFile<JobAssignmentInput>(`${ MISSION_URL }/job/handle`, formData);
}

export function addJobDeadlineExtension(formData: FormData) {
  return baseApi.postWithFile<string>(`${ MISSION_URL }/job/extension-deadline`, formData);
}