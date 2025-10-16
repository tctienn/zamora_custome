import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveInsurance(data: FormData) {
  return baseApi.postWithFile(`${HRM_URL}/api/insurances/save`, data);
}

function exportExcelInsuranceByMonth(_: any, search: {
  keyword: string,
  month: number,
  year: number,
}) {
  return baseApi.downloadWithFullResponse(
    `${HRM_URL}/api/insurances/excel`,
    {},
    { params: { ...search } },
  );
}

export { exportExcelInsuranceByMonth, saveInsurance };