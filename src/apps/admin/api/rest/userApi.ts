import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { User } from '@/common/model/User';

function updateUser(formData: FormData) {
  return baseApi.postWithFile<User>(`${ADMIN_URL}/user`, formData);
}

function createUpdateUser(formData: FormData) {
  return baseApi.postWithFile(`${ADMIN_URL}/create-update-user`, formData);
}

function downloadTemplate() {
  return baseApi.postWithFile<Blob>(`${ADMIN_URL}/get-template`, {});
}

function updateSignature(formData: FormData) {
  return baseApi.postWithFile(`${ADMIN_URL}/update-signature`, formData);
}

export { createUpdateUser, downloadTemplate, updateSignature, updateUser };
