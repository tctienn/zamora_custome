import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function downloadById(id: string, rootOrg?: string) {
  return baseApi.downloadWithFullResponseWithGetMethod(`${DOCUMENT_URL}/attachment/download-by-id/${id}/${rootOrg}`);
}