import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import type { SearchFields, SearchModel } from '@/common/model/search';

export const useGlobalSearchStore = defineStore('search', () => {
  const fields = ref<SearchFields>();
  const model = ref<SearchModel>({} as SearchModel);
  const submit = ref(false);
  const router = useRouter();
  const advancedSearch = ref<any>();
  const isUsingAdvancedSearch = ref(false);
  const showAdvancedSearch = ref(false);

  router.beforeEach(() => {
    fields.value = undefined;
    model.value = {} as SearchModel;
  });

  function setFields(value: SearchFields) {
    fields.value = value;
  }

  const setAdvancedSearchValue = (value: any) => {
    advancedSearch.value = value;
  };

  const setIsUsingAdvancedSearch = (value: boolean) => {
    isUsingAdvancedSearch.value = value;
  };
  
  const setAdvancedSearch = (value: boolean) => {
    showAdvancedSearch.value = value;
  };

  function handleSubmit() {
    Object.entries(model.value).forEach(([key, entryValue]) => {
      if (entryValue instanceof Array && entryValue.length === 0) {
        delete model.value[key];
      }
      if (typeof entryValue === 'string' && entryValue.trim().length <= 0) {
        delete model.value[key];
      }
    });
    submit.value = !submit.value;
    advancedSearch.value = undefined;
  }

  function $reset() {
    model.value = {};
    // submit.value = !submit.value;
  }

  return {
    fields,
    model,
    setFields,
    submit,
    handleSubmit,
    $reset,
    setAdvancedSearch,
    showAdvancedSearch,
    advancedSearch,
    setAdvancedSearchValue,
    isUsingAdvancedSearch,
    setIsUsingAdvancedSearch
  };
});
