import { every, isEmpty, trimEnd } from 'lodash';

import { AUDIO_FILE_TYPES_SUPPORTED, EDITABLE_FILE_TYPES, IMAGE_FILE_TYPES_SUPPORTED, VIDEO_FILE_TYPES_SUPPORTED } from '@/apps/ecm/constants';
import { DOCUMENT_URL, ECM_URL, EDITOR_URL, FILE_URL, GATEWAY_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import { useUserStore } from '@/common/store/user';

export const convertFileSize = (size: number | string, decimals = 2) => {
  size = typeof size === 'string' ? parseInt(size) : size;
  if (size === 0) {
    return '0 Bytes';
  }
  const k = 1024,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

export const convertBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

export const convertBase64ToBlob = (base64: string) => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(base64.split(',')[1]);

  // separate out the mime component
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab], { type: mimeString });
};

export const getBase64FileSize = (base64: string | undefined): number => {
  try {
    return typeof base64 === 'undefined' || isEmpty(base64) ? 0 : atob(base64.substring(base64.indexOf(',') + 1)).length;
  } catch (e) {
    return 0;
  }
};

export function downloadFile(file: Blob | MediaSource, filename: string) {
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadFileUrl(fileUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = filename;
  a.click();
  a.remove();
  URL.revokeObjectURL(fileUrl);
}

export function checkFileTypeViewer(extension: string) {
  if (extension === 'pdf') {
    return 'PdfViewer';
  } else if (IMAGE_FILE_TYPES_SUPPORTED.includes(extension)) {
    return 'ImageViewer';
  } else if (AUDIO_FILE_TYPES_SUPPORTED.includes(extension)) {
    return 'AudioViewer';
  } else if (VIDEO_FILE_TYPES_SUPPORTED.includes(extension)) {
    return 'VideoViewer';
  } else if (EDITABLE_FILE_TYPES.includes(extension)) {
    return 'EditableViewer';
  } else {
    return 'UnsupportedFile';
  }
}

export function checkFileTypeViewVersion(extension: string) {
  if (extension === 'pdf') {
    return 'PdfViewerVersion';
  } else if (IMAGE_FILE_TYPES_SUPPORTED.includes(extension)) {
    return 'ImageViewerVersion';
  } else if (AUDIO_FILE_TYPES_SUPPORTED.includes(extension)) {
    return 'AudioViewerVersion';
  } else if (VIDEO_FILE_TYPES_SUPPORTED.includes(extension)) {
    return 'VideoViewerVersion';
  } else if (EDITABLE_FILE_TYPES.includes(extension)) {
    return 'EditableViewerVersion';
  } else {
    return 'UnsupportedFile';
  }
}

export function generateFileEditorUrl(fileId: string) {
  const encodedUri = encodeURIComponent(`${ ECM_URL }/wopi/files/${ fileId }?access_token=${ useUserStore().authentication }`);
  return `${ EDITOR_URL }?WOPISrc=${ encodedUri }`;
}

export function generateFileVersionEditorUrl(fileId: string, md5: string) {
  const encodedUri = encodeURIComponent(`${ ECM_URL }/wopi/version/${ fileId }?md5=${ md5 }&access_token=${ useUserStore().authentication }`);
  return `${ EDITOR_URL }?WOPISrc=${ encodedUri }`;
}

export function generateFileDocumentEditorUrl(attachmentId: string) {
  const encodedUri = encodeURIComponent(`${ DOCUMENT_URL }/wopi/files/${ attachmentId }?access_token=${ useUserStore().authentication }`);
  return `${ EDITOR_URL }?WOPISrc=${ encodedUri }`;
}

export function generateFileDocumentEditorUrlWithoutToken(attachmentId: string) {
  const encodedUri = encodeURIComponent(`${ DOCUMENT_URL }/wopi/files/${ attachmentId }`);
  return `${ EDITOR_URL }?WOPISrc=${ encodedUri }`;
}

export function generateFileDownloadUrl(fileUrl: string) {
  return `${ FILE_URL }/download/${ useUserStore().getTenantFromToken() }/main${ fileUrl }`;
}

export function generateChatAttachmentDownloadUrl(fileUrl: string | undefined) {
  return generateDownloadUrl(fileUrl);
}

export function generateDownloadUrl(fileUrl: string | undefined) {
  if (fileUrl) {
    return `${ FILE_URL }/download/${ fileUrl }`;
  }
}

export function generateDownloadUrlWaterMark(id: string | undefined) {
  if (id) {
    return `${ DOCUMENT_URL }/attachment/download-by-id/${ id }`;
  }
}

export function generateChatAttachmentPreviewUrl(fileUrl: string | undefined) {
  return `${ FILE_URL }/preview/${ fileUrl }`;
}

//Dung cho ECM
export function generateFilePreviewUrl(fileUrl: string) {
  return `${ FILE_URL }/preview/${ useUserStore().getTenantFromToken() }/main${ fileUrl }`;
}

export function generateFilePreviewPdfUrl(fileUrl: string, extension: string) {
  return `${ FILE_URL }/preview/${ useUserStore().getTenantFromToken() }/preview${ trimEnd(fileUrl, extension) }pdf`;
}

export function generatePreviewFileUrl(url: string | undefined) {
  if (url) {
    return `${ FILE_URL }/preview/${ url }`;
  }
}

export const generateAvatarUrl = (avatar: string | undefined) => generatePreviewFileUrl(avatar);

export function handleFileImageError(e: Event) {
  if (e.target) {
    (e.target as HTMLImageElement).src = getFileIcon('blank');
  }
}

export function getFolderIcon() {
  return '/images/folder-icons/folder.svg';
}

export function getFileIcon(extension: string) {
  return `/images/file-extension-icons/${ extension }.svg`;
}

export function getFileExtension(fileName: string, includeDot = false) {
  return fileName.substring(fileName.lastIndexOf('.') + (includeDot ? 0 : 1), fileName.length);
}

export function isAllEmpty(arrays: Array<object>) {
  return every(arrays, isEmpty);
}

export function viewPreVersion(fileUrl: string, md5: string) {
  return baseApi.download<string>(`${ FILE_URL }/vcs/viewPreVersion${ fileUrl }?md5=${ md5 }`, {});
}

export function removeVersion(fileUrl: string, md5: string, version: string) {
  return baseApi.post<string>(`${ FILE_URL }/vcs/removeVersion${ fileUrl }?md5=${ md5 }&&version=${ version }`, {});
}

export function getPreviewFile(url: string) {
  return GATEWAY_URL + '/files/preview/' + url;
}