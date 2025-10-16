import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function exportExcelLaborStructureReport(
  searchModel: object   
) {
  return baseApi.downloadWithFullResponse(
    `${HRM_URL}/api/employees/export-excel`,
    searchModel,
  );
}