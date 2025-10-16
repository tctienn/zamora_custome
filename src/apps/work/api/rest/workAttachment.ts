import { WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createFile(formData: FormData) {
  return baseApi.postWithFile(`${WORK_URL}/work-attachment/create-file`, formData);
}

function downloadFolder(path: string, objectId: string) {
  return baseApi.download<Blob>(`${WORK_URL}/work-attachment/download-folder?path=${path}&objectId=${objectId}`, {});
}

export { createFile, downloadFolder };