import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const loading = ref(false);

  const searchType = ref<'name' | 'content'>('name');

  return {
    loading,
    searchType
  };
}, { persist: true });