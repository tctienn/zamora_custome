import { AUTH_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function generateLoginQrCodeForWeb() {
  return baseApi.downloadWithGet<Blob>(`${ AUTH_URL }/login/qr/generate`);
}

function statusLogin(sessionId: string) {
  return baseApi.post(`${ AUTH_URL }/login/qr/status?sessionId=${ sessionId }`, undefined);

}

function generateQRForMobile() {
  return baseApi.downloadWithGet<Blob>(`${ AUTH_URL }/qr/generate`);
}

export {
  generateLoginQrCodeForWeb,
  generateQRForMobile,
  statusLogin
};