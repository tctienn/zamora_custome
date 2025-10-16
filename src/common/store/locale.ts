import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export const useLocaleStore = defineStore('locale', () => {
  const allLanguages = ['vi', 'en'];
  const currentLanguage = ref(allLanguages[0]);
  const { locale } = useI18n();

  function changeLanguage(value: string) {
    if (allLanguages.includes(value)) {
      currentLanguage.value = value;
      locale.value = value;
    }
  }

  return {
    allLanguages,
    currentLanguage,
    changeLanguage
  };
}, { persist: { storage: sessionStorage } }
);