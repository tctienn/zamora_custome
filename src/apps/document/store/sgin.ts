import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

import { findPersonal } from '@/apps/admin/api/graphql/admin-customer-tenant';
import type { UserInterface } from '@/apps/admin/model/User';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';
import { useUserStore } from '@/common/store/user';

export const useSignaturesStore = defineStore('signatures', () => {
  const { user } = storeToRefs(useUserStore());
  const currentUser = ref<UserInterface>();
  const signatures = computed(() => {
    const signs: string[] = [];
    if (currentUser.value?.mainSign) {
      signs.push(generatePreviewFileUrl(currentUser.value.mainSign) || '');
    }
    if (currentUser.value?.flashingSignature) {
      signs.push(generatePreviewFileUrl(currentUser.value.flashingSignature) || '');
    }
    return signs;
  });

  function loadSignatures() {
    if (user.value?.id) {
      findPersonal()
        .onResult((result) => {
          currentUser.value = result.data.findPersonal;
        });
    }
  }

  watch(user, (value) => {
    if (value?.id) {
      loadSignatures();
    }
  }, { immediate: true });

  return { signatures };
});
