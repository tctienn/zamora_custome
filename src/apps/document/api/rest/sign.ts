import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function signApprove(docId: string, data: FormData) {
  return baseApi.postWithFile(`${ DOCUMENT_URL }/sign-approve/out-going/${ docId }`, data);
}

function signPresent(docId: string, data: FormData) {
  return baseApi.postWithFile(`${ DOCUMENT_URL }/sign-approve/sign-present/${ docId }`, data);
}

function signCaProvide(data: FormData) {
  return baseApi.syncWithFile<string>(`${ DOCUMENT_URL }/sign-provide/sign`, data);
}

export {
  signApprove,
  signCaProvide,
  signPresent
};