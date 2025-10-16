import type { CcdocInterface } from '@/apps/document/model/ccdoc';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function ccDoc(data: CcdocInterface) {
  return baseApi.post<DocIn>(`${DOCUMENT_URL}/doc-in/cc-doc`, data);
}

export { ccDoc };
