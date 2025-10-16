import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';

import { findParameterConfig } from '@/apps/work/api/graphql/parameter-config';
import type { ParameterProject, ParameterTask } from '@/apps/work/model/parameterConfig';

export const useParameterConfigStore = defineStore('parameterConfig', () => {
  const isFetched = ref<boolean>(false);

  const parameterTask = ref<Readonly<ParameterTask>>();
  const parameterProject = ref<Readonly<ParameterProject>>();

  function fetch() {
    findParameterConfig().onResult(param => {
      const value = param?.data?.findParameterConfig?.value;
      parameterTask.value = value?.task;
      parameterProject.value = value?.project;
      isFetched.value = true;
    });
  }

  onMounted(() => {
    if (!isFetched.value) {
      fetch();
    }
  });

  return {
    parameterProject,
    parameterTask,
    fetch,
  };
});