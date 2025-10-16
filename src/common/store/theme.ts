import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import { useLayout } from '@/common/components/app/composables/layout';

export const useThemeStore = defineStore('theme', () => {
  const defaultMenuMode = ref('slim-plus');
  const defaultTheme = ref('indigo');
  const menuMode = ref(defaultMenuMode.value);
  const theme = ref(defaultTheme.value);
  const dark = ref(false);

  const {
    layoutConfig,
    changeTheme,
  } = useLayout();

  watch(menuMode, (newVal) => {
    layoutConfig.menuMode.value = newVal;
  });

  watch(theme, (newVal) => {
    changeTheme(newVal);
  });

  function changeDefaultTheme(value: string) {
    defaultTheme.value = value;
    theme.value = value;
  }

  function changeDefaultMenuMode(mode: string) {
    defaultMenuMode.value = mode;
    menuMode.value = mode;
  }

  function reset() {
    menuMode.value = defaultMenuMode.value;
    theme.value = defaultTheme.value;
  }

  return {
    dark,
    menuMode,
    theme,
    reset,
    changeDefaultMenuMode,
    changeDefaultTheme
  };
}, { persist: { storage: sessionStorage } });