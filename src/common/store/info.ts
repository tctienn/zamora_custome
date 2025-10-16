import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import { generateDownloadUrl } from '@/common/helpers/file-utils';
import type { ProductInfoInterface } from '@/common/model/productInfo';

export const useInfoStore = defineStore('info', () => {
  const info = ref<ProductInfoInterface>();
  watch(() => info?.value?.logo, (value) => {
    //find <link rel='icon'> and change href
    if (value) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.setAttribute('href', generateDownloadUrl(value) || '/favicon.png');
      }
    }
  });

  return { info };
}, { persist: true });