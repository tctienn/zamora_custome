import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function exportExcelHrmEvaluateEmployee(
  searchModel: {evaluateEmployeeReportId?: string}  
) {
  return baseApi.downloadWithFullResponse(
    `${HRM_URL}/api/evaluate-employee/export-excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function exportExcelHrmSummaryEvaluateEmployee(
  searchModel: {evaluateEmployeeSummaryReportId?: string}  
) {
  return baseApi.downloadWithFullResponse(
    `${HRM_URL}/api/evaluate-employee-summary/export-excel`,
    {},
    { params: { ...searchModel } },
  );
}

export function approvedEvaluate(id: string, status = 'APPROVED') {
  return baseApi.put<string>(`${ HRM_URL }/api/evaluate-employee-summary/${id}/status`, { status });
}