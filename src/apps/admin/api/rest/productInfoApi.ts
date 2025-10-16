import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import { getDomain } from '@/common/helpers/utils';

function createProductInfo(formData: FormData) {
  return baseApi.postWithFile(`${ADMIN_URL}/product-info/create`, formData);
}

function getProductInfo() {
  return baseApi.get(`${ADMIN_URL}/product-info/getProductInfo`);
}

function getPublicProductInfo() {
  return baseApi.get(`${ADMIN_URL}/public/product-info/getProductInfo`, { headers: { 'X-TenantID': getDomain() } });
}

export { createProductInfo, getProductInfo, getPublicProductInfo };
