import { FILE_URL, WORK_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function uploadTaskAttachment(formData: FormData) {
  return baseApi.postWithFile(`${WORK_URL}/task-attachment/upload`, formData);
}

function saveDownloadTaskAttachmentLog(id: string) {
  return baseApi.post<boolean>(`${WORK_URL}/task-attachment/save-download-log/${id}`, {});
}

function downloadTaskAttachment(path: string) {
  return baseApi.downloadWithGet<Blob>(`${FILE_URL}/download/${path}`);
}

export { downloadTaskAttachment, saveDownloadTaskAttachmentLog, uploadTaskAttachment };