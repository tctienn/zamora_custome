// quy hoach
import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createOrUpdatePlaning(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/planing/createOrUpdate`, data);
}

export { createOrUpdatePlaning };