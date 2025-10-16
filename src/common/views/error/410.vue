<template>
  <div class='align-items-center flex flex-column h-full h-screen justify-content-center'>
    <h2 class='text-white'>
      <span class='block'>{{ t("common.errorPage.urlExpired") }}</span>
    </h2>
    <h4 class='text-white'>
      <router-link
        class='hover:underline text-primary-400'
        replace
        :to='{name: "Login"}'>{{ t("authentication.gotoLogin") }}
      </router-link>
    </h4>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<script lang="ts">
export default { name: 'UrlExpired' };
</script>