<template>
  <div class='authentication-body flex flex-row'>
    <div class='authentication-image'>
      <img
        alt='Login image'
        aria-label='Forgot password image'
        src='@/common/assets/images/forgot-password-background.svg'/>
    </div>

    <div class='authentication-panel flex flex-column p-8 p-fluid'>
      <div class='user-avatar'>
        <AppAvatar
          :avatar='user.avatar'
          :label='user.fullName'
          size='8'/>
      </div>

      <h3 class='font-bold mb-5 text-center'>{{ user.fullName }}</h3>
      <label class='font-bold line-height-3 mb-4 text-center'>
        {{ t('authentication.forgotPassword.inputNewPassword') }}
      </label>

      <div class='authentication-input mt-5'>
        <span class='p-input-icon-left'>
          <AppIcon
            class='h-4rem line-height-4 w-4rem'
            name='password'
            size='2'/>
          <InputText
            id='password'
            v-model='password'
            class='h-4rem pl-7'
            :disabled='!userId.length'
            maxlength='255'
            name='password'
            :placeholder='t("authentication.password")'
            type='password'/>
        </span>
        <div
          v-for='error of v$.password.$errors'
          :key='error.$uid'
          class='input-errors'>
          <small
            id='password'
            class='p-error'>{{ error.$message }}</small>
        </div>
      </div>

      <div class='authentication-input mt-5'>
        <span class='p-input-icon-left'>
          <AppIcon
            class='h-4rem line-height-4 w-4rem'
            name='password'
            size='2'/>
          <InputText
            id='confirmPassword'
            v-model='confirmPassword'
            class='h-4rem pl-7'
            :disabled='!userId.length'
            maxlength='255'
            name='confirmPassword'
            :placeholder='t("authentication.forgotPassword.confirmPassword")'
            type='password'/>
        </span>
        <div
          v-for='error of v$.confirmPassword.$errors'
          :key='error.$uid'
          class='input-errors'>
          <small
            v-if='error.$validator !== "sameAs" || (error.$validator === "sameAs" && password && confirmPassword)'
            id='confirmPassword'
            class='p-error'>{{ error.$message }}</small>
        </div>
      </div>

      <div class='mt-5 text-center'>
        <Button
          class='h-4rem'
          :disabled='!userId.length'
          :label='t("common.confirm")'
          type='button'
          @click='() => informationDialog.type === ACTION_RESULT.SUCCESS ? {} : recoveryPassword()'></Button>

        <router-link
          class='inline-block mt-3'
          replace
          :to='{ name: "Login"}'>
          {{ t('authentication.gotoLogin') }}
        </router-link>
      </div>
    </div>
  </div>

  <InformationDialog
    v-if='informationDialog.show'
    v-bind='informationDialog'
    @hide='() => informationDialog.type === ACTION_RESULT.SUCCESS ? router.replace({name: "Login"}) : hideInformationDialog(informationDialog)'/>
</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, sameAs } from '@vuelidate/validators';
import { assign } from 'lodash';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { findUserById, resetPasswordRest } from '@/apps/admin/api/rest/publicApi';
import InformationDialog from '@/apps/admin/components/dialog/InformationDialog.vue';
import { ACTION_RESULT } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import { decodeBase64Utf8, hideInformationDialog } from '@/common/helpers/utils';

const { t } = useI18n() || {};
const route = useRoute();
const router = useRouter();

const user = reactive({
  avatar: '',
  fullName: ''
});

const { query } = route.params;
const decodeQuery = typeof query === 'string' ? decodeBase64Utf8(query).split('|') : [];
const userId = ref('');
const urlExpiredTime = ref<Date>(new Date());
const tenantName = ref('');

let apiOptions = { headers: { 'X-TenantID': tenantName.value } };
if (decodeQuery.length) {
  userId.value = decodeQuery[0] || '';
  user.fullName = decodeQuery[1] || '';
  user.avatar = !decodeQuery[2] || decodeQuery[2] === 'null' ? '' : decodeQuery[2];
  tenantName.value = decodeQuery[3] || '';
  urlExpiredTime.value = decodeQuery[4] ? new Date(decodeQuery[4]) : new Date();
}

findUserById(userId.value, apiOptions).then((res) => {
  // if (!res?.forgotPassword) {
  if (!res) {
    router.replace({ name: 'UrlExpired' });
  }
});

const password = ref('');
const confirmPassword = ref('');

const validateRules = {
  password: { required: helpers.withMessage(t('authentication.login.passwordRequired'), required) },
  confirmPassword: {
    required: helpers.withMessage(t('authentication.forgotPassword.confirmPasswordRequired'), required),
    sameAs: helpers.withMessage(t('authentication.forgotPassword.confirmPasswordNotMatch'), sameAs(password))
  }
};

const v$ = useVuelidate(validateRules, {
  password,
  confirmPassword
});

const informationDialog = reactive({
  type: '',
  title: '',
  message: '',
  show: false
});

function recoveryPassword() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      resetPasswordRest({
        userId: userId.value,
        newPassword: password.value
      }, apiOptions).then((response) => {
        assign(informationDialog, {
          type: response ? ACTION_RESULT.SUCCESS : ACTION_RESULT.FAILURE,
          title: response ? 'common.result.title.success' : 'common.result.title.error',
          message: response ? 'authentication.resetPassword.passwordChanged' : 'common.result.message.somethingWrong',
          show: true
        });
      }).catch((error) => {
        toastError({ message: error });
      });
    }
  });
}
</script>

<script lang='ts'>
export default { name: 'RecoveryPassword' };
</script>
