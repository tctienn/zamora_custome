<template>
  <div class='authentication-body flex flex-row overflow-hidden'>
    <div class='authentication-image'>
      <img
        alt='Login image'
        aria-label='forgot-password image'
        src='@/common/assets/images/forgot-password-background.svg'/>
    </div>

    <div class='authentication-panel flex flex-column p-8 p-fluid'>
      <h3 class='font-bold mb-5 text-center'>{{ t('authentication.login.forgotPassword') }}</h3>
      <label class='font-bold line-height-3 mb-4 text-center'>
        {{ t('authentication.forgotPassword.inputEmail') }}
      </label>

      <div class='authentication-input'>
        <span class='p-input-icon-left'>
          <AppIcon
            class='h-4rem line-height-4 w-4rem'
            name='mail'
            size='2'/>
          <InputText
            id='email'
            v-model='email'
            class='h-4rem pl-7'
            maxlength='255'
            name='email'
            :placeholder='t("common.email")'
            type='text'/>
        </span>
        <div
          v-for='e of v$.email.$errors'
          :key='e.$uid'
          class='input-errors'>
          <small
            id='username'
            class='p-error'>{{ e.$message }}</small>
        </div>
      </div>

      <div class='authentication-input mt-5'>
        <span class='p-input-icon-left'>
          <AppIcon
            class='h-4rem line-height-4 w-4rem'
            name='account_circle'
            size='2'/>
          <InputText
            id='account'
            v-model='account'
            class='h-4rem pl-7'
            maxlength='255'
            name='account'
            :placeholder='t("authentication.account")'
            type='text'/>
        </span>
        <div
          v-for='e of v$.account.$errors'
          :key='e.$uid'
          class='input-errors'>
          <small
            id='email'
            class='p-error'>{{ e.$message }}</small>
        </div>
      </div>

      <div class='mt-5 text-center'>
        <small
          v-if='error'
          id='error'
          class='block mb-2 p-error'>{{ t(error) }}</small>
        <Button
          class='h-4rem'
          :label='t("authentication.forgotPassword.recoveryPassword")'
          type='button'
          @click='() => informationDialog.show ? {} : requestRecoveryPassword()'></Button>
      </div>
    </div>
  </div>

  <InformationDialog
    v-if='informationDialog.show'
    v-bind='informationDialog'
    @hide='() => hideInformationDialog(informationDialog)'/>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core';
import { email as validEmail, helpers, required } from '@vuelidate/validators';
import { assign } from 'lodash';
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { forgotPasswordRest } from '@/apps/admin/api/rest/publicApi';
import InformationDialog from '@/common/components/dialog/InformationDialog.vue';
import { ACTION_RESULT } from '@/common/constants';
import { toastError } from '@/common/helpers/custom-toast-service';
import { getDomain, hideInformationDialog } from '@/common/helpers/utils';

let router = useRouter();
const { t } = useI18n() || {};

const account = ref('');
const email = ref('');
const error = ref('');

const informationDialog = reactive({
  type: '',
  title: '',
  message: '',
  show: false
});

watch(() => ({
  show: informationDialog.show,
  type: informationDialog.type
}), (value, oldValue) => {
  if (value.type === ACTION_RESULT.FAILURE) {
    error.value = informationDialog.message;
  }
  if (oldValue.type === ACTION_RESULT.SUCCESS) {
    error.value = '';
  }
  // if (oldValue.type === ACTION_RESULT.SUCCESS && oldValue.show) {
  //   router.replace({ name: 'RecoveryPassword' });
  // }
});

const validateRules = {
  account: { required: helpers.withMessage(t('authentication.login.usernameRequired'), required) },
  email: {
    required: helpers.withMessage(t('common.emptyEmail'), required),
    email: helpers.withMessage(t('common.invalidEmail'), validEmail)
  },
};

const v$ = useVuelidate(validateRules, {
  account,
  email
});

function requestRecoveryPassword() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      forgotPasswordRest({
        email: email.value,
        username: account.value,
        forwardUrl: window.location.origin + router.resolve({ name: 'RecoveryPassword' }).href
      }, { headers: { 'X-TenantID': getDomain() } }).then((response) => {
        assign(informationDialog, {
          type: response ? ACTION_RESULT.SUCCESS : ACTION_RESULT.FAILURE,
          title: response ? 'common.requestSentSuccessfully' : 'common.requestSubmissionFailed',
          message: response ? 'authentication.forgotPassword.accessEmail' : 'authentication.forgotPassword.accountNotMatch',
          show: true
        });
      }).catch((error) => {
        toastError({ message: error });
      });
    }
  });
}
</script>

<script>
export default { name: 'ForgotPassword' };
</script>
