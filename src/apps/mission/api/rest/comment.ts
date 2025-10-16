import { MISSION_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

export function createChatComment(data: FormData) {
  return baseApi.postWithFile<boolean>(`${MISSION_URL}/job/chat`, data);
}