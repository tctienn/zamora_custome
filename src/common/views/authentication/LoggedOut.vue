<template>
  <div class='align-items-center bg-primary-300 flex flex-column h-screen justify-content-center'>
    <h2 class='text-white'>
      <span class='block'>{{ t("authentication.logout.loggedOut") }}</span>
    </h2>
    <h4 class='text-white'>
      {{ t("authentication.logout.redirectingLogin") }}
      {{ t("authentication.logout.redirectingLoginCountdown", {count: countdown}) }},
      <router-link
        class='hover:underline text-primary'
        replace
        :to='{name: "Login"}'>{{ t("authentication.logout.loginAgain") }}
      </router-link>
    </h4>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const countdown = ref(3);
const interval = setInterval(() => {
  if (!countdown.value) {
    router.push({ name: 'Login' });
    clearInterval(interval);
    return;
  }
  countdown.value--;
}, 1000);

onBeforeUnmount(() => clearInterval(interval));
</script>

<script>
export default { name: 'LoggedOut' };
</script>