import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function savePropose(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/propose/save`, data);
}

export function updatePropose(id: string, data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/propose/update/${id}`, data);
}