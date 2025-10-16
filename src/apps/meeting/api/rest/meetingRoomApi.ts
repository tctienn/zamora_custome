import { MEETING_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function createMeetingRoom(formData: FormData) {
  return baseApi.postWithFile(`${MEETING_URL}/meeting-room`, formData);
}

function updateMeetingRoom(formData: FormData) {
  return baseApi.putWithFile(`${MEETING_URL}/meeting-room`, formData);
}
export { createMeetingRoom, updateMeetingRoom };