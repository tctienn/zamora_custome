import { MEDIA_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createMedia(mediaType: string, formData: FormData) {
  return baseApi.postWithFile(`${MEDIA_URL}/media/${mediaType}`, formData);
}

function updateMedia(mediaType: string, id: string, formData: FormData) {
  return baseApi.putWithFile(`${MEDIA_URL}/media/${mediaType}/${id}`, formData);
}

export { createMedia, updateMedia };