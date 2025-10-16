import { ECM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createOrUpdateDocument(formData: FormData) {
  return baseApi.postWithFile(`${ECM_URL}/documentFrom/createDocumentFrom`, formData);
}
function createOrUpdateDocumentTo(formData: FormData) {
  return baseApi.postWithFile(`${ECM_URL}/documentTo/createDocumentTo`, formData);
}

export { createOrUpdateDocument, createOrUpdateDocumentTo };