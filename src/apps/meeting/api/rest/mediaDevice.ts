import { MEETING_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createMediaDevice(formData: FormData) {
  return baseApi.postWithFile(`${MEETING_URL}/media-device`, formData);
}

function updateMediaDevice(formData: FormData) {
  return baseApi.putWithFile(`${MEETING_URL}/media-device`, formData);
}

export { createMediaDevice, updateMediaDevice };
