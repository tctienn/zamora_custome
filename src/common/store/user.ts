import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { User } from '@/common/model/User';

export const useUserStore = defineStore('user', () => {
  const expiredAfter = 12 * 60 * 60 * 1000;
  const user = ref<User>({});
  const userRole = ref<string[]>([]);
  const refreshToken = ref('');
  const authentication = ref('');
  const expired = ref<Date>();

  function setExpired() {
    const date = new Date();
    date.setTime(date.getTime() + expiredAfter);
    expired.value = date;
  }

  function setUser(userData: User) {
    user.value = userData;
    setExpired();
  }

  function setUserRole(role: string[]) {
    userRole.value = role;
    setExpired();
  }

  function setRefreshToken(refreshTokenData: string) {
    refreshToken.value = refreshTokenData;
    setExpired();
  }

  function setAuthentication(authenticationData: string) {
    authentication.value = authenticationData;
    setExpired();
  }

  function resetUserStore() {
    user.value = {};
    refreshToken.value = '';
    authentication.value = '';
  }

  function getTenantFromToken() {
    const mid = authentication.value.replace('Bearer ', '').split('.')[1];
    return JSON.parse(atob(mid))['tenant'] ?? '';
  }

  return {
    expired,
    refreshToken,
    setRefreshToken,
    authentication,
    setAuthentication,
    user,
    setUser,
    setUserRole,
    userRole,
    resetUserStore,
    getTenantFromToken
  };
}, { persist: true });
