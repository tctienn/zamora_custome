import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { getAllUserMoreInfoGraphql, getUserCacheGraphql } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserMoreInfo } from '@/apps/admin/model/User';

export const useUserMoreInfoStore = defineStore('userMoreInfo', () => {
  let isFetchedAllUsers = false;
  const usersMoreInfo = ref<{ [key: string]: UserMoreInfo }>({});

  const allUsers = computed(() => Object.values(usersMoreInfo.value));

  const fetchUserMoreInfo = (userId: string) => {
    if (!usersMoreInfo.value[userId]) {
      getUserCacheGraphql(userId)
        .onResult(res => {
          usersMoreInfo.value[userId] = res.data.getUserCache;
        });
    }
  };

  function fetchAllUsers() {
    if (isFetchedAllUsers) {
      return;
    }
    getAllUserMoreInfoGraphql()
      .onResult(res => {
        res.data.getAllUserMoreInfo.forEach((user: UserMoreInfo) => {
          usersMoreInfo.value[user.id] = user;
          isFetchedAllUsers = true;
        });
      });
  }

  function avatarError(userId: string, error: boolean) {
    let user = usersMoreInfo.value[userId];
    user = {
      ...user,
      avatarError: error
    };
    usersMoreInfo.value[userId] = user;
  }

  function resetStore() {
    usersMoreInfo.value = {};
    isFetchedAllUsers = false;
  }

  return {
    usersMoreInfo,
    allUsers,
    fetchUserMoreInfo,
    fetchAllUsers,
    avatarError,
    resetStore
  };
});