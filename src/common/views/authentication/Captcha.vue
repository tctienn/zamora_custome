<template>
  <div class='login-captcha'>
    <VueClientRecaptcha
      class='mt-5'
      :value='captcha'
      @is-valid='checkValidCaptcha'>
      <template #icon>
        <AppIcon
          class='h-4rem line-height-4 text-center w-4rem'
          name='autorenew'
          size='2'/>
      </template>
    </VueClientRecaptcha>

    <div class='authentication-input mt-5'>
      <span class='p-input-icon-left'>
        <AppIcon
          class='h-4rem line-height-4 w-4rem'
          name='report'
          size='2'/>
        <InputText
          id='captcha'
          v-model='captcha'
          class='h-4rem pl-7'
          maxlength='255'
          name='captcha'
          :placeholder='t("authentication.login.captchaPlaceholder")'/>
      </span>
      <small
        v-if='captchaError'
        id='captcha'
        class='p-error'>{{ t(captchaError) }}</small>
    </div>
  </div>

</template>

<script setup>
import { isEmpty } from 'lodash';
import { ref } from 'vue';
import VueClientRecaptcha from 'vue-client-recaptcha';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  captchaError: {
    type: String,
    default: ''
  },
  updateValidCaptcha: {
    type: Function,
    default: () => void {}
  }
});

const { t } = useI18n() || {};

const captcha = ref(null);

const checkValidCaptcha = (value) => {
  props.updateValidCaptcha({
    isEmpty: isEmpty(captcha.value),
    isValid: value
  });
};
</script>

<script>
export default { name: 'Captcha' };
</script>
