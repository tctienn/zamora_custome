import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

import { findByUserSupport } from '@/apps/document/api/graphql/user-support';
import { RoleType } from '@/apps/document/model/permission';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import type { UserSupport } from '@/common/model/User';

export const useUserSupportStore = defineStore('user_support', () => {
  const userSupport = ref<UserSupport>();
  const supportPermission = computed(() => userSupport.value?.supportPermission);
  const supportsPermission = computed(() => userSupport.value?.supportsPermission);

  const { userDeptRole } = storeToRefs(useDocumentRolesStore());
  watch(userDeptRole, (value) => {
    if (value.userId.trim().length === 0) {
      userSupport.value = undefined;
    }

    if (value.userId.trim().length !== 0 && value.roleId === RoleType.TRO_LY) {
      findByUserSupport(value).onResult(result => {
        userSupport.value = result.data?.findByUserSupport;
      });
    }
  }, {
    immediate: true,
    deep: true
  });

  return {
    userSupport,
    supportPermission,
    supportsPermission,
  };
});