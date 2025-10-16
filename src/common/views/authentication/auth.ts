import { get } from 'lodash';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentUser } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { getRolePermissions } from '@/apps/admin/api/rest/role';
import { usePermissionStore } from '@/apps/admin/store/permission';
import { defaultConfig } from '@/common/api/rest/admin-tenant';
import type { UserLoginResponse } from '@/common/model/User';
import { useThemeStore } from '@/common/store/theme';
import { useUserStore } from '@/common/store/user';
import { useInfosStore } from '@/common/store/userInfo';

export const useAuthHelper = () => {
  const loadingRolePermissions = ref(false);
  const {
    setRefreshToken,
    setUser,
    setAuthentication,
    setUserRole
  } = useUserStore();
  const { putUser } = useInfosStore();
  const {
    changeDefaultMenuMode,
    changeDefaultTheme
  } = useThemeStore();

  const route = useRoute();
  const router = useRouter();

  function setUserInfoAfterLogin(response: UserLoginResponse) {
    const {
      user,
      accessToken,
      refreshToken,
      tokenType
    } = response;
    setUser(user);
    setAuthentication(`${tokenType} ${accessToken}`);
    setRefreshToken(refreshToken);
    putUser(user);

    getRolePermissions().then((data) => {
      if (data) {
        usePermissionStore().permissions = data;

        const redirect = get(route, 'query.redirect', '/');
        router.push({ path: redirect.toString() });
        loadConfig();
      }
    }).finally(() => {
      loadingRolePermissions.value = false;
    });

    function loadConfig() {
      defaultConfig().then((res) => {
        if (res) {
          changeDefaultMenuMode(res.menuMode);
          changeDefaultTheme(res.theme);
        }
      });
    }

    const { onResult: currentUserResult } =
        currentUser();

    const roles = ref();

    currentUserResult((res) => {
      roles.value = get(res, 'data.currentUser.roles', []);
      setUserRole(roles.value?.length ? roles.value : '');
    });
  }

  return {
    setUserInfoAfterLogin,
    loadingRolePermissions
  };
};
