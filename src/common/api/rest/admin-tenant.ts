import { ADMIN_TENANT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { ProductInfoInterface } from '@/common/model/productInfo';

export function getPublicProductInfo() {
  return baseApi.get<ProductInfoInterface>(`${ ADMIN_TENANT_URL }/public/product-info/getProductInfo`,
    { headers: { 'X-TenantID': 'master' } });
}

export function defaultConfig() {
  return baseApi.get<{ menuMode: string, theme: string }>(`${ ADMIN_TENANT_URL }/public/product-config`,
    { headers: { 'X-TenantID': 'master' } });
}