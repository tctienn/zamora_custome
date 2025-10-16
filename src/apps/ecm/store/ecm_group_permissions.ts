import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import { userPermissions } from '@/apps/ecm/api/rest/groupPermission';

export type GroupPermission = {
  path: string
  permissions: {
    [key: string]: string[]
  }
}
export const useEcmPermissions = defineStore('ecm_permission',
  () => {
    const groupId = ref<string>();
    const permission = ref<GroupPermission[]>();

    function hasPermission(type: string, path: string, action: string): boolean {
      const permissions = findRecursiveInPermissions(path);
      if (!permissions) {
        return false;
      }
      return permissions.permissions[type]?.includes(action.toUpperCase()) == true;
    }

    function findRecursiveInPermissions(path: string): GroupPermission | null {
      if (!permission.value) {
        return null;
      }
      const find = permission.value?.find(p => p.path === path);
      if (find) {
        return find;
      } else {
        return path === '' ? null : findRecursiveInPermissions(subStringBeforeLast(path, '/'));
      }
    }

    function subStringBeforeLast(s: string, delimiter: string) {
      const index = s.lastIndexOf(delimiter);
      if (index > 0) {
        return s.slice(0, index);
      } else {
        return '';
      }
    }

    watch(groupId, () => {
      if (groupId.value) {
        userPermissions(groupId.value)
          .then(a => {
            if (a) {
              permission.value = a;
            }
          });
      }
    });

    function resetStore() {
      groupId.value = undefined;
      permission.value = undefined;
    }

    return {
      groupId,
      permission,
      hasPermission,
      resetStore
    };
  }, { persist: { storage: sessionStorage } });