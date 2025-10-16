import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { Pageable } from '@/common/model/query';

function adminSearchAllDocIn(search: SearchModel, pageable: Pageable) {
  return baseApi.get(`${DOCUMENT_URL}/admin-action/search`, {
    params: {
      ...search,
      ...pageable,
    }
  });
}
function adminDeleteDocIn(id:string){
  return baseApi.del(`${DOCUMENT_URL}/admin-action/${id}`, {});
}

function adminSaveDocIn(id:string, form:FormData){
  return baseApi.putWithFile<DocIn>(`${DOCUMENT_URL}/admin-action/${id}`, form);
}

function adminFindDocInById(id:string){
  return baseApi.get<DocIn>(`${DOCUMENT_URL}/admin-action/${id}`);
}

export { adminDeleteDocIn, adminFindDocInById, adminSaveDocIn, adminSearchAllDocIn };