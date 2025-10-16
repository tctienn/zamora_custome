import type { Group } from '@/apps/chat/model/group';
import { ADMIN_URL, ECM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createOrUpdateGroup(formData: FormData) {
  return baseApi.postWithFile<Group>(`${ADMIN_URL}/group/saveGroup`, formData);
}

function saveGroup(formData: FormData) {
  return baseApi.postWithFile<Group>(`${ECM_URL}/group/saveGroup`, formData);
}

export { createOrUpdateGroup, saveGroup };
