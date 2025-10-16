import type { UserLoginResponse } from '@/common/model/User';
import { useUserStore } from '@/common/store/user';

import { AUTH_URL } from '../configService';
import baseApi, { REFRESH_TOKEN_URL } from './baseApi';

type TokenRefresh = {
  accessToken: string,
  refreshToken: string
};

function login(email: string, password: string, otpCode: string | undefined) {
  return baseApi.post<UserLoginResponse>(`${AUTH_URL}/customer/login`, {
    email,
    password,
    otpCode
  });
}

function logout() {
  return baseApi.post<string>(`${AUTH_URL}/logout`, {});
}

let refreshPromise: Promise<void> | null = null;

async function refreshToken() {
  const userStore = useUserStore();
  if (!userStore.refreshToken) {
    return Promise.reject('No refresh token');
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const rs = await baseApi.post<TokenRefresh>(REFRESH_TOKEN_URL, { refreshToken: userStore.refreshToken, });
      if (rs) {
        userStore.setAuthentication(rs.accessToken);
        userStore.setRefreshToken(rs.refreshToken);
      }
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function turnOnTwoFactor() {
  return baseApi.post<string>(`${AUTH_URL}/turnOn2FA`, {});
}

function turnOffTwoFactor() {
  return baseApi.post<string>(`${AUTH_URL}/turnOff2FA`, {});
}

export { login, logout, refreshToken, turnOffTwoFactor, turnOnTwoFactor };
