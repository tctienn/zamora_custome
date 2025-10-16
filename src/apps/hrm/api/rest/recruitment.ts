import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveRecruiltment(data: FormData) {
  return baseApi.postWithFile(`${ HRM_URL }/recruitment/proposal/save`, data);
}

export { saveRecruiltment };