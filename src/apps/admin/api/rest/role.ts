import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function getRolePermissions() {
  return baseApi.get<string[]>(`${ADMIN_URL}/role/permissions`);
}

export { getRolePermissions };