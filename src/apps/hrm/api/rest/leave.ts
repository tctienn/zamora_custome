import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createLeaveApplication(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/leave-applications/create`, data);
}

function updateLeaveApplication(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/leave-applications/update/${id}`, data);
}

function getLeaveApplication(id: string) {
  return baseApi.get(`${HRM_URL}/api/leave-applications/${id}`, {});
}

export { createLeaveApplication, getLeaveApplication, updateLeaveApplication };