import type { ISignConfig } from '@/apps/admin/model/sign-config';
import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function getVtSignConfig() {
  return baseApi.get<ISignConfig>(`${ ADMIN_URL }/vt-sign-config`,);
}

function saveVtSignConfig(form: FormData) {
  return baseApi.postWithFile<ISignConfig>(`${ ADMIN_URL }/vt-sign-config`, form);
}

export {
  getVtSignConfig,
  saveVtSignConfig,
};