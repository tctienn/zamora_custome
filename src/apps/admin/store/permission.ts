import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([]);

  function hasPermission(per: string): boolean {
    return permissions.value.some(p => p.startsWith(per));
  }

  function resetStore() {
    permissions.value = [];
  }

  return {
    permissions,
    hasPermission,
    resetStore
  };
}, { persist: true });
