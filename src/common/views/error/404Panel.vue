<template>
  <div class='exception-panel flex flex-column justify-content-center p-5'>
    <h4 class='font-bold'>{{ t('common.errorPage.404.pageNotFound') }}</h4>
    <span class='line-height-3'>{{ t('common.errorPage.404.resourceNotAvailable') }}</span>

    <img
      alt='error'
      class='my-5'
      height='150'
      src='@/common/assets/images/error.svg'>

    <Button
      :label='t("common.errorPage.gotoHomepage")'
      type='button'
      @click='goHome'></Button>
  </div>
</template>

<script lang='ts'>
import { useI18n } from 'vue-i18n';

import router from '@/common/router';
import { useMenuStore } from '@/common/store/menu';

export default {
  name: '404Panel',

  setup() {
    return { t: useI18n().t };
  },

  methods: {
    goHome() {
      useMenuStore().setCurrentApp('system');
      router.push({ name: 'Home' });
    }
  }
};
</script>