import { MEDIA_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createHonor(formData: FormData) {
  return baseApi.postWithFile(`${MEDIA_URL}/honor`, formData);
}

function updateHonor(formData: FormData, id: string) {
  return baseApi.putWithFile(`${MEDIA_URL}/honor/${id}`, formData);
}

export { createHonor, updateHonor };