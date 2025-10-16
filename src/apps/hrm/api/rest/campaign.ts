import { HRM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveCampaign(data: FormData) {
  return baseApi.postWithFile(`${ HRM_URL }/recruitment/campaign/save`, data);
}

export { saveCampaign };