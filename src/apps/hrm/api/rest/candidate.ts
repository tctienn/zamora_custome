import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveCandidate(data: FormData) {
  return baseApi.postWithFile(`${ HRM_URL }/recruitment/candidate/save`, data);
}

export { saveCandidate };