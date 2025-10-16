import { DocTemplate } from '@/apps/document/model/docTemplate';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function saveDocTemplate(formData: FormData) {
  return baseApi.postWithFile<DocTemplate>(
    `${DOCUMENT_URL}/doc-template/create-or-update-doc-template`,
    formData,
  );
}

export { saveDocTemplate };
