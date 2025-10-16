import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function getSignProvideConfig() {
  return baseApi.get<string>(`${ ADMIN_URL }/sign-provide-config`);
}

function saveSignProvideConfig(provider: string) {
  return baseApi.post(`${ ADMIN_URL }/sign-provide-config`, { provider });
}

export {
  getSignProvideConfig,
  saveSignProvideConfig,
};