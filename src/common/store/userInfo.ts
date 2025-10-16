import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { UserInterface } from '@/common/model/User';

export const useInfosStore = defineStore('user_infos', () => {
  const infos = ref<UserInterface[]>([]);

  function putUser(data: UserInterface) {
    if (data.username && !exists(data.username)) {
      infos.value.push(data);
    } else {
      const index = infos.value.findIndex(info => info.username === data.username);
      infos.value[index] = data;
    }
  }

  function exists(username: string) {
    return infos.value.some(info => info.email === username || info.username === username);
  }

  function getUser(username: string): UserInterface | undefined {
    return infos.value.find(info => info.email === username || info.username === username);
  }

  return {
    infos,
    putUser,
    getUser
  };
}, { persist: { storage: localStorage } });