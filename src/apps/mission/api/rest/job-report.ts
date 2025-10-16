import { MISSION_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function createReport(formData: FormData) {
  return baseApi.postWithFile<boolean>(`${ MISSION_URL }/job/report-to-leader`, formData);
}