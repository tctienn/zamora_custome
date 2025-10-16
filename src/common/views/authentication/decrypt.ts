import * as CryptoJS from 'crypto-js';
export function decryptQrLoginToken(token: string) {
  const str = atob(token);
  const payload = JSON.parse(str);
  if('secretKey' in payload && 'encryptedUrl' in payload) {
    const key = CryptoJS.enc.Base64.parse(payload['secretKey']); // Parse Base64 key
    const decrypted = CryptoJS.AES.decrypt(payload['encryptedUrl'], key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}