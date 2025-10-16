import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function exportCategoryRest(groupCode: string) {
  return baseApi.getWithFile<Blob>(`${ADMIN_URL}/export-excel/category/${groupCode}`);
}

function exportOrganizationRest() {
  return baseApi.getWithFile<Blob>(`${ADMIN_URL}/export-excel/organization`);
}

export { exportCategoryRest, exportOrganizationRest };