import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ElementConfig } from '../model/form-config';

export const useFormStore = defineStore('form-store', () => {
  const form = ref<ElementConfig[]>([]);

  const saveFormCreated = (formConfig: ElementConfig[]) => {
    form.value = formConfig;
  };
  const clearForm = () => {
    form.value = [];
  };
  return {
    form,
    saveFormCreated,
    clearForm,
  };
});