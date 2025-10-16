import type { ChatConversation } from '@/apps/chat/model/chat';
import type { Group } from '@/apps/chat/model/group';
import { CHAT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';
import { User } from '@/common/model/User';

function searchUser(keyword: string) {
  return baseApi.get<User[]>(`${CHAT_URL}/search/user?keyword=${keyword}`);
}

function searchGroupUserIn(keyword: string) {
  return baseApi.get<Group[]>(`${CHAT_URL}/search/group-user-in?keyword=${keyword}`);
}

function searchMessage(keyword: string) {
  return baseApi.get<ChatConversation[]>(`${CHAT_URL}/search/message?keyword=${keyword}`);
}

export { searchGroupUserIn, searchMessage, searchUser };