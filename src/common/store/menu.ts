import { cloneDeep, kebabCase, keys, lowerFirst, trimStart } from 'lodash';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { hasPermission } from '@/apps/admin/services/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
// import { ECM_GROUP_CODE } from '@/apps/ecm/router';
import i18n from '@/common/i18n';
import type { Menu } from '@/common/model/menu';
import { routes } from '@/common/router';

export type AppMenu = {
  label?: string | symbol
  icon?: string
  menuCode?: string
  to?: string
  items?: AppMenu[]
}
const SYS_CODE = 'system';
const DOC_CODE = '/DOCUMENT';

const {
  t,
  te
} = i18n.global;

function defaultRoutesMap() {
  const modules: any = import.meta.glob('/src/apps/**/router/index.ts', { eager: true });
  const regex = '/src/apps/(?<appName>.*)/router/index.ts';
  const map: { [key: string]: RouteRecordRaw[] } = {};
  for (const key in modules) {
    const match = key.match(regex);
    const appName = match?.groups?.appName ?? '';
    map[appName] = modules[key].default;
  }

  map[SYS_CODE] = routes;

  return map;
}

export function defaultRoutes() {
  let routes: RouteRecordRaw[] = [];
  const routesMap = defaultRoutesMap();
  for (const key of keys(routesMap)) {
    routes = [...routes, ...routesMap[key]];
  }
  return routes;
}

function getPath(parentPath: string, r: RouteRecordRaw) {
  return trimStart(parentPath, '/') + (r.path === '/' ? '' : `/${trimStart(r.path, '/')}`);
}

export const useMenuStore = defineStore('menu', () => {

  const allMenus = ref<{ [key: string]: RouteRecordRaw[] }>(defaultRoutesMap());
  const currentApp = ref<string>();
  const configuredApps = ref<Menu[]>();
  const { currentPermissions } = storeToRefs(useDocumentRolesStore());

  const currentMenus = computed((): AppMenu[] => {
    if (!currentApp.value) {
      currentApp.value = SYS_CODE;
    }
    if (allMenus.value) {
      const f = filterMenu(cloneDeep(allMenus.value[currentApp.value]));
      const menus = mapToMenu(currentApp.value, '', f) ?? [];
      return menus?.[0]?.items ?? [];
    }
    return [];
  });

  // const alreadyHasGroupsInRoutes = computed((): boolean => {
  //   function findGroupsInRoutes(route: RouteRecordRaw): RouteRecordRaw[] | undefined {
  //     if (route.meta?.menuCode && ECM_GROUP_CODE === route.meta.menuCode) {
  //       return route.children;
  //     } else if (route.children?.length) {
  //       route.children.forEach(r => {
  //         const find = findGroupsInRoutes(r);
  //         if (find) {
  //           return find;
  //         }
  //       });
  //     }
  //     return undefined;
  //   }
  //
  //   let find;
  //   for (const r of allMenus.value[ECM_CODE]) {
  //     find = findGroupsInRoutes(r);
  //     if (find) {
  //       break;
  //     }
  //   }
  //   return find ? find.length === 0 || find[0].meta?.showInMenu === true : false;
  // });

  function mapToMenu(appName: string, parentPath: string, routes?: RouteRecordRaw[]): AppMenu[] | undefined {
    return routes?.map(r => {
      const keyName = lowerFirst(r.name?.toString());
      return {
        label: te(`${appName}.menu.${keyName}`) ? t(`${appName}.menu.${keyName}`) : te(`menu.${keyName}`) ? t(`menu.${keyName}`) : r.name,
        icon: r.meta?.icon?.toString(),
        menuCode: r.meta?.menuCode?.toString(),
        to: `/${trimStart(getPath(parentPath, r), '/')}`,
        items: r.children && r.children.length ? mapToMenu(appName, getPath(parentPath, r), r.children) : undefined
      };
    });
  }

  function filterMenu(routes?: RouteRecordRaw[]) {
    const filter = routes?.filter(r => r.meta?.showInMenu)
      .filter(r => currentApp.value === SYS_CODE
        || (r.meta?.functionMapping ? menuHasPermission(r.meta.functionMapping as string) : true));
    filter?.forEach(f => {
      if (f.children) {
        f.children = filterMenu(f.children);
      }
    });
    return filter;
  }

  function menuHasPermission(per: string) {
    if (per.includes(DOC_CODE)) {
      return currentPermissions.value.some(p => p.startsWith(per));
    } else {
      return hasPermission(per);
    }
  }

  // function changeEcmGroupMenus(groups: ShortGroup[]) {
  //   function appendGroupsToRoute(route: RouteRecordRaw, groups: ShortGroup[]) {
  //     if (route.meta?.menuCode && ECM_GROUP_CODE === route.meta.menuCode) {
  //       route.children = groups.map(g => {
  //         return {
  //           path: `${g.id}`,
  //           meta: {
  //             requiredAuth: true,
  //             showInMenu: true
  //           },
  //           name: g.name,
  //           component: () => import('@/apps/ecm/views/group-documents/GroupDocument.vue'),
  //           children: g.permission === Permission[Permission.FULL_CONTROL]
  //             ? [{
  //               path: 'trash',
  //               meta: {
  //                 requiredAuth: true,
  //                 showInMenu: true,
  //                 icon: 'delete',
  //               },
  //               name: 'EcmGroupTrash',
  //               component: () => import('@/apps/ecm/views/group-documents/GroupTrash.vue'),
  //             }]
  //             : undefined
  //         };
  //       });
  //     } else if (route.children?.length) {
  //       route.children.forEach(r => appendGroupsToRoute(r, groups));
  //     }
  //   }
  //
  //   const ecmRoutes = allMenus.value[ECM_CODE];
  //   ecmRoutes.forEach(r => appendGroupsToRoute(r, groups));
  //   allMenus.value[ECM_CODE] = ecmRoutes;
  // }

  function setCurrentApp(app: string) {
    let value = kebabCase(app);
    if (!(value in allMenus.value)) {
      value = SYS_CODE;
    }
    currentApp.value = value;
  }

  function resetMenuStore() {
    allMenus.value = defaultRoutesMap();
    configuredApps.value = undefined;
    currentApp.value = '';
  }

  return {
    // alreadyHasGroupsInRoutes,
    currentMenus,
    // changeEcmGroupMenus,
    configuredApps,
    currentApp,
    setCurrentApp,
    resetMenuStore,
  };
}, { persist: true });
