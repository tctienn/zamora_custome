import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

import { refreshToken } from '@/common/api/rest/authApi';
import { resetStoreAndRedirectToLogin } from '@/common/service/reset_store';
import { useUserStore } from '@/common/store/user';

import { GATEWAY_URL } from '../configService';

const LOGIN_URL = `${GATEWAY_URL}/auth/customer/login`;
export const REFRESH_TOKEN_URL = `${GATEWAY_URL}/auth/refreshToken`;

function initialClient(hasFile: boolean, isDownload = false, isSync = false) {
  const userStore = useUserStore();

  const axiosInstance = axios.create({
    headers: {
      Accept: '*/*',
      'Content-Type': hasFile ? 'multipart/form-data' : 'application/json'
    },
    responseType: isDownload ? 'blob' : 'json',
    timeout: isSync ? 1800000 : 120000
  });
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = userStore.authentication;
      if (token) {
        config.headers['Authorization'] = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  axiosInstance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      if (originalConfig.url !== LOGIN_URL && err.response) {
        // Access Token was expired
        if (err.response.status === 401 && originalConfig.url === REFRESH_TOKEN_URL) {
          resetStoreAndRedirectToLogin();
          return Promise.reject(err);
        }
        if (err.response.status === 403 && !originalConfig._retry) {
          originalConfig._retry = true;
          try {
            await refreshToken();
            return axiosInstance(originalConfig);
          } catch (_error) {
            resetStoreAndRedirectToLogin();
            return Promise.reject(_error);
          }
        }
      }

      return Promise.reject(err);
    }
  );
  return axiosInstance;
}

async function request<T>(method: string, path: string, data: object | undefined, hasFile = false, isDownload = false, isSync = false, config?: AxiosRequestConfig)
  : Promise<T | void> {

  data = data || {};
  let request: Promise<AxiosResponse<T>>;
  const client = initialClient(hasFile, isDownload, isSync);
  switch (method) {
  case 'get':
    request = client.get<T>(path, config);
    break;
  case 'post':
    request = client.post<T>(path, data || {}, config);
    break;
  case 'patch':
    request = client.patch<T>(path, data || {}, config);
    break;
  case 'put':
    request = client.put<T>(path, data || {}, config);
    break;
  case 'delete':
    request = client.delete<T>(path, config);
    break;
  default:
    request = client.get<T>(path, config);
    break;
  }
  return request
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      throw err.response.data;
    });
}

function downloadWithFullResponse(path: string, data?: object, config?: AxiosRequestConfig) {
  const client = initialClient(false, true, true);
  return client.post(path, data, config);
}

function downloadWithFullResponseWithGetMethod(path: string, config?: AxiosRequestConfig) {
  const client = initialClient(false, true, true);
  return client.get(path, config);
}

function postForDownload(path: string, data: object | undefined, config?: AxiosRequestConfig) {
  const client = initialClient(false, true, true);
  return client.post(path, data, config);
}

function post<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
  return request<T>('post', path, data, false, false, false, config);
}

function get<T>(path: string, config?: AxiosRequestConfig) {
  return request<T>('get', path, undefined, false, false, false, config);
}

function getWithFile<T>(path: string, config?: AxiosRequestConfig) {
  return request<T>('get', path, undefined, false, true, false, config);
}

function put<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
  return request<T>('put', path, data, false, true, false, config);
}

function del<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
  return request<T>('delete', path, data, false, false, false, config);
}

function postWithFile<T>(path: string, data: object | FormData | undefined, config?: AxiosRequestConfig) {
  return request<T>('post', path, data, true, false, false, config);
}

function putWithFile<T>(path: string, data: object | FormData | undefined, config?: AxiosRequestConfig) {
  return request<T>('put', path, data, true, false, false, config);
}

function download<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
  return request<T>('post', path, data, false, true, true, config);
}

function downloadWithGet<T>(path: string, config?: AxiosRequestConfig) {
  return request<T>('get', path, undefined, false, true, true, config);
}

function sync<T>(path: string, data: object | undefined, config?: AxiosRequestConfig) {
  return request<T>('post', path, data, false, false, true, config);
}

function syncWithFile<T>(path: string, data: FormData, config?: AxiosRequestConfig) {
  return request<T>('post', path, data, true, false, true, config);
}

export default {
  del,
  download,
  downloadWithGet,
  downloadWithFullResponse,
  get,
  getWithFile,
  post,
  postWithFile,
  putWithFile,
  put,
  request,
  sync,
  syncWithFile,
  downloadWithFullResponseWithGetMethod,
  postForDownload
};
