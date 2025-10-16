import { type AxiosRequestConfig } from 'axios';
import { toLower } from 'lodash';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import type { EcmFile, FolderTree } from '@/apps/ecm/model/file-folder';
import { ECM_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function uploadFile(type: ServiceType | undefined, data: FormData, config?: AxiosRequestConfig) {
  return baseApi.postWithFile<EcmFile>(`${ECM_URL}/manage/${toLower(ServiceType[type ? type : ServiceType.PERSON])}/createFile`, data, config);
}

function uploadMultiFile(type: ServiceType | undefined, data: FormData, config?: AxiosRequestConfig) {
  return baseApi.postWithFile<EcmFile[]>(`${ECM_URL}/manage/${toLower(ServiceType[type ? type : ServiceType.PERSON])}/createFiles`, data, config);
}

function getTreeFolder(type: ServiceType | undefined, folderId: string) {
  return baseApi.get<FolderTree>(`${ECM_URL}/manage/${toLower(ServiceType[type ? type : ServiceType.PERSON])}/getTreeFolder?folderId=${folderId}`);
}

function downloadMultiple(type: ServiceType | undefined, ids: { id: string, isFolder: boolean }[]) {
  return baseApi.downloadWithFullResponse(`${ECM_URL}/manage/${toLower(ServiceType[type ? type : ServiceType.PERSON])}/downloadMultiple`, ids);
}

function uploadNewVersion(type: ServiceType | undefined, data: FormData) {
  return baseApi.postWithFile<EcmFile>(`${ECM_URL}/manage/${toLower(ServiceType[type ? type : ServiceType.PERSON])}/uploadNewVersion`, data);
}

function downloadVersion(type: ServiceType | undefined, fileId: string, md5: string) {
  return baseApi.downloadWithFullResponse(`${ECM_URL}/manage/${toLower(ServiceType[type ? type : ServiceType.PERSON])}/downloadVersion?fileId=${fileId}&md5=${md5}`);
}

export {
  downloadMultiple,
  downloadVersion,
  getTreeFolder,
  uploadFile,
  uploadMultiFile,
  uploadNewVersion
};