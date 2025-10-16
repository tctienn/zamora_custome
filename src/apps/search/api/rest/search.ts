import { SEARCH_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { Pageable } from '@/common/model/query';

export function searchFull(keyword: string, module: string, indexName: string | null, pageable: Pageable) {
  return baseApi.get(`${SEARCH_URL}/elastic/search?keyword=${keyword}&module=${module}${indexName ? `&indexName=${indexName}` : ''}&page=${pageable.page}&size=${pageable.size}`);
}