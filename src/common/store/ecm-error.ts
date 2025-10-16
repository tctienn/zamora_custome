import { ApolloError } from '@apollo/client/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEcmErrorStore = defineStore('ecm-error',
  () => {
    const loading = ref(false);
    const error = ref<'no-permission' | 'not-found'>();

    function startFetchingData() {
      loading.value = true;
      error.value = undefined;
    }

    function setErrorDone(param: ApolloError) {
      loading.value = false;
      for (const er of param.graphQLErrors) {
        if (er.extensions) {
          const { errorType } = er.extensions;
          if (errorType === 'PERMISSION_DENIED') {
            error.value = 'no-permission';
            return;
          }
        }
      }
      error.value = 'not-found';
    }

    function setSuccessDone() {
      loading.value = false;
      error.value = undefined;
    }

    return {
      loading,
      error,
      startFetchingData,
      setErrorDone,
      setSuccessDone
    };
  });