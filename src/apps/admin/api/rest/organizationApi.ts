import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveOrUpdateOrganization(formData: FormData) {
  return baseApi.postWithFile(`${ADMIN_URL}/organization/saveOrUpdateOrganization`, formData);
}

function saveActionIntoOrganizationHistory(formData: FormData) {
  return baseApi.postWithFile(`${ADMIN_URL}/organization/saveActionIntoOrganizationHistory`, formData);
}

export { saveActionIntoOrganizationHistory, saveOrUpdateOrganization };
