<template>
  <div class='exception-panel flex flex-column justify-content-center p-5'>
    <h4 class='font-bold'>{{ t('common.errorPage.403.accessDenied') }}</h4>
    <span class='line-height-3'>{{ t('common.errorPage.403.notHavePermission') }}</span>

    <img
      alt='access-denied'
      class='my-5'
      height='140'
      src='@/common/assets/images/access-denied.svg'>

    <Button
      :label='t("common.errorPage.gotoHomepage")'
      type='button'
      @click='goHome'/>
  </div>
</template>

<script lang='ts'>
import { useI18n } from 'vue-i18n';

import router from '@/common/router';
import { useMenuStore } from '@/common/store/menu';

export default {
  name: '403Panel',

  setup() {
    return { t: useI18n().t };
  },

  methods: {
    goHome() {
      useMenuStore().setCurrentApp('system');
      router.push({ name: 'Home' });
    }
  },
};
</script>