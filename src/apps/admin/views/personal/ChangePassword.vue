<template>
  <h5>
    <slot name='title'>
      {{ t('admin.user.userDetail.changePassword') }}
    </slot>
  </h5>
  <div class='change-password'>
    <form @submit.prevent='changePassword'>
      <div class='p-fluid'>
        <div
          class='field'>
          <label
            v-required
            for='oldPassword'>{{ t('admin.user.userDetail.oldPassword') }}</label>
          <Password
            id='oldPassword'
            v-model='oldPassword'
            :feedback='false'
            :placeholder='t("admin.user.userDetail.oldPassword")'
            :toggle-mask='true'
            @change='resetSubmitStatus'></Password>
          <ValidateErrorMessage :errors='v$.oldPassword.$errors'/>
        </div>

        <div class='field'>
          <label
            v-required
            for='password'>{{ t('admin.user.userDetail.password') }}</label>
          <Password
            id='password'
            v-model='password'
            :placeholder='t("admin.user.userDetail.password")'
            :strong-regex='passwordRegex'
            :toggle-mask='true'
            @change='resetSubmitStatus'></Password>
          <ValidateErrorMessage :errors='v$.password.$errors'/>
        </div>

        <div class='field'>
          <label
            v-required
            for='confirmPassword'>{{ t('admin.user.userDetail.confirmPassword') }}</label>
          <Password
            id='confirmPassword'
            v-model='confirmPassword'
            :feedback='false'
            :placeholder='t("admin.user.userDetail.confirmPassword")'
            :strong-regex='passwordRegex'
            :toggle-mask='true'
            @change='resetSubmitStatus'></Password>
          <ValidateErrorMessage :errors='v$.confirmPassword.$errors'/>
        </div>
      </div>

      <div class='grid md:justify-content-center mt-5'>
        <Button
          class='ml-3'
          icon='pi pi-check'
          :label='t("admin.user.userDetail.changePassword")'
          type='submit'/>
      </div>
    </form>
  </div>

</template>

<script setup lang='ts'>
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, sameAs } from '@vuelidate/validators';
import { ref } from 'vue';

import { changePasswordInProfile } from '@/apps/admin/api/graphql/admin-customer-tenant';
import { toastError, toastSuccess } from '@/common/helpers/custom-toast-service';
import i18n from '@/common/i18n/index';
import { useUserStore } from '@/common/store/user';

const userStore = useUserStore();
const {
  mutate: changePasswordMutate,
  onDone: changePasswordOnDone
} = changePasswordInProfile();
const oldPassword = ref('');
const password = ref('');
const confirmPassword = ref('');
const submitted = ref(false);
const { t } = i18n.global;

const validateRules = {
  oldPassword: { required: helpers.withMessage(t('admin.user.userDetail.oldPasswordIsEmpty'), required) },
  password: { required: helpers.withMessage(t('admin.user.userDetail.passwordIsEmpty'), required) },
  confirmPassword: {
    required: helpers.withMessage(t('admin.user.userDetail.confirmPasswordIsEmpty'), required),
    sameAsPassword: helpers.withMessage(t('admin.user.userDetail.passwordNotMatch'), sameAs(password))
  },
};

const v$ = useVuelidate(validateRules, {
  oldPassword,
  password,
  confirmPassword
});

function passwordRegex() {
  return '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})';
}

function changePassword() {
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      changePasswordMutate({
        id: userStore.user.id,
        oldPassword: oldPassword.value,
        newPassword: password.value
      });
    }
  }).catch((error) => {
    toastError({ message: error });
  });
}

changePasswordOnDone(() => {
  toastSuccess({ message: t('admin.user.message.changePasswordSuccess') });
});

function resetSubmitStatus() {
  submitted.value = false;
  // errorCode = '';
}

</script>

<style scoped>

</style>
