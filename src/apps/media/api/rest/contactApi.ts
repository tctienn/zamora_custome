import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function exportExcelContact(
  _: any,
  data: { keyword: string; organization: string },
) {
  return baseApi.downloadWithFullResponse(
    `${ADMIN_URL}/contact/excel`,
    {},
    {
      params: {
        keyword: data.keyword,
        organization: data.organization,
      },
    },
  );
}
