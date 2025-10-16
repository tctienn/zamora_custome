import type { ISignConfig } from '@/apps/admin/model/sign-config';
import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function getSignConfig() {
  return baseApi.get<ISignConfig>(`${ ADMIN_URL }/sign-config`,);
}

function saveSignConfig(form: FormData) {
  return baseApi.postWithFile<ISignConfig>(`${ ADMIN_URL }/sign-config`, form);
}

export {
  getSignConfig,
  saveSignConfig,
};
