import { ADMIN_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import type { Menu } from '@/common/model/menu';

function getConfiguredApps() {
  return baseApi.get<Menu[]>(`${ ADMIN_URL }/menu/configuredApps`);
}

function getConfiguredMenus() {
  return baseApi.get<Menu[]>(`${ ADMIN_URL }/menu/configuredMenus`);
}

export { getConfiguredApps, getConfiguredMenus };