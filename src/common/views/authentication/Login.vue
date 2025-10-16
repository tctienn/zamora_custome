<template>
  <div class='login-container'>
    <div class='bg-primary login-topbar'>
      <router-link
        class='app-logo'
        to='/'>
        <img
          alt='app logo'
          :src='logo'/>
        <span class='app-name'>{{ productName }}</span>
      </router-link>
      <a
        class='align-items-center flex gap-1 phone'
        :href='`tel:${hotline}`'>
        <i class='pi pi-phone'></i>
        {{ hotline }}</a>
    </div>
    <div
      class='grid login-content-wrapper m-0'>
      <div class='hidden lg:block lg:col-8'>
        <div
          class='app-title flex flex-column gap-4 h-full justify-content-center mx-8'>
          <div class='animation-delay-500 animation-duration-1000 fadeinleft uppercase'>
            <div class='font-bold text-6xl'>{{ title }}</div>
            <div class='font-semibold text-4xl'>{{ subtitle }}</div>
          </div>
          <div>
            <div
              class='animation-delay-500 animation-duration-1000 fadeindown text-lg'>
              {{ description }}
            </div>
          </div>
        </div>

      </div>
      <div
        class='align-items-center col flex flex-column gap-6 h-full justify-content-start lg:col-4 lg:justify-content-center overflow-hidden'>
        <div
          class='animation-delay-500 animation-duration-1000 app-title fadeinleft lg:hidden mt-6 text-center uppercase'>
          <div class='font-bold text-6xl'>{{ title }}</div>
          <div class='font-semibold text-4xl'>{{ subtitle }}</div>
        </div>

        <Card
          class='animation-duration-200 fadein w-25rem'
          :class='{"hidden": showQRCodeLogin}'>
          <template #header>
            <div class='align-items-center flex flex-column gap-3 pt-5'>
              <AppAvatar
                :avatar='userAvatar'
                :label='loginInfo.email || "USER"'
                size='5rem'/>
              <div class='font-semibold text-2xl'>
                {{ t('authentication.login.loginSystem') }}
              </div>
            </div>
          </template>

          <template #content>
            <form
              class='px-4'
              @submit.prevent='signIn'>
              <div class='field'>
                <label
                  class='cursor-pointer font-semibold'
                  for='email'>{{ t('authentication.email') }}</label>
                <IconField icon-position='left'>
                  <InputIcon class='pi pi-user'></InputIcon>
                  <InputText
                    id='email'
                    v-model='loginInfo.email'
                    class='w-full'
                    :invalid='v$.email.$invalid && v$.$dirty'
                    @blur='changeUserAvatar'/>
                </IconField>
                <div
                  v-for='error of v$.email.$errors'
                  :key='error.$uid'
                  class='input-errors'>
                  <small
                    class='p-error'>{{ error.$message }}</small>
                </div>
              </div>
              <div class='field'>
                <label
                  class='cursor-pointer font-semibold'
                  for='password'>{{ t('authentication.password') }}</label>
                <IconField
                  icon-position='left'>
                  <InputIcon class='pi pi-lock'></InputIcon>
                  <Password
                    v-model='loginInfo.password'
                    class='w-full'
                    :feedback='false'
                    input-class='w-full'
                    input-id='password'
                    :invalid='v$.password.$invalid && v$.$dirty'
                    toggle-mask/>
                </IconField>
                <div
                  v-for='error of v$.password.$errors'
                  :key='error.$uid'
                  class='input-errors'>
                  <small
                    class='p-error'>{{ error.$message }}</small>
                </div>
                <small
                  v-if='!isEmpty(errorCode)'
                  id='error'
                  class='block mb-2 p-error'>{{ t(`authentication.login.${errorCode}`) }}</small>
              </div>

              <div class='flex justify-content-end'>
                <router-link
                  class='hover:underline'
                  :to='{ name: "ForgotPassword"}'>
                  {{ t('authentication.login.forgotPassword') }}?
                </router-link>
              </div>

              <Captcha
                v-if='loginFailed > 2'
                :captcha-error='captchaError'
                :update-valid-captcha='updateValidCaptcha'></Captcha>
              <Button
                class='mt-4 w-full'
                :label='loginButtonText'
                :loading='signingIn || loadingRolePermissions'
                type='submit'>
                <template #loadingicon>
                  <i class='absolute pi pi-spin pi-spinner'></i>
                </template>

              </Button>
              <div class='flex justify-content-end mt-2'>
                <a
                  class='cursor-pointer hover:underline'
                  @click='showQRCodeLogin=!showQRCodeLogin'>{{ t('authentication.login.byQrCode') }}</a>
              </div>
            </form>
          </template>

          <template #footer>
            <div class='font-normal text-center text-sm'>
              Copyright @{{ copyright }}
            </div>
          </template>
        </Card>
        <QRCodeLogin
          v-if='showQRCodeLogin'
          class='animation-duration-200 fadein w-25rem'
          @back='showQRCodeLogin=false'/>
      </div>

    </div>
  </div>
  <OtpDialog
    v-model:show-otp-dialog='showOtpDialog'
    :otp-length='6'
    :submit='userLogin'/>

  <InformationDialog
    v-if='informationDialog.show'
    v-bind='informationDialog'
    @hide='() => hideInformationDialog(informationDialog)'/>
</template>

<script setup lang='ts'>

import { useVuelidate } from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { assign, get, isEmpty } from 'lodash';
import { storeToRefs } from 'pinia';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { getPublicProductInfo } from '@/apps/admin/api/rest/productInfoApi';
import { login } from '@/common/api/rest/authApi';
import InformationDialog from '@/common/components/dialog/InformationDialog.vue';
import { ACTION_RESULT, APP_NAME, LOGIN, OTP_CODE_REQUIRED } from '@/common/constants';
import { calculateColorBasedOnBackground } from '@/common/helpers/color-util';
import { generatePreviewFileUrl } from '@/common/helpers/file-utils';
import { hideInformationDialog } from '@/common/helpers/utils';
import type { ProductInfoInterface } from '@/common/model/productInfo';
import { useInfoStore } from '@/common/store/info';
import { useInfosStore } from '@/common/store/userInfo';
import { useAuthHelper } from '@/common/views/authentication/auth';
import Captcha from '@/common/views/authentication/Captcha.vue';
import OtpDialog from '@/common/views/authentication/OtpDialog.vue';
import QRCodeLogin from '@/common/views/authentication/QRCodeLogin.vue';

const { t } = useI18n();
const loginInfo = reactive({
  email: '',
  password: ''
});
const userAvatar = ref<string>();
const productInfo = ref();
const titleColor = ref('white');
const { getUser } = useInfosStore();
const { info } = storeToRefs(useInfoStore());

const loginFailed = ref(0);
const captchaError = ref('');
const captchaInvalid = ref(0);
const isCaptchaValid = reactive<{ isEmpty?: boolean, isValid?: boolean }>({});
const signingIn = ref(false);
const errorCode = ref('');
const productName = computed(() => info.value?.productName || APP_NAME);
const showOtpDialog = ref(false);
const showQRCodeLogin = ref(false);
const informationDialog = reactive({
  type: '',
  title: '',
  message: '',
  show: false
});

const {
  loadingRolePermissions,
  setUserInfoAfterLogin
} = useAuthHelper();

const logo = computed(() => generatePreviewFileUrl(info.value?.logo) || '/logo.png');
const loginBackground = computed(() => generatePreviewFileUrl(info.value?.background) || '/images/login/default_bg.jpg');
const loginBackgroundUrl = computed(() => `url("${loginBackground.value}")`);
const hotline = computed(() => info.value?.hotline || '+84 989 762 355');
const title = computed(() => info.value?.title || 'Nền tảng');
const copyright = computed(() => info.value?.copyright || 'Zamora.vn 2024');
const subtitle = computed(() => info.value?.subTitle || 'Quản trị và điều hành doanh nghiệp');
const description = computed(() => info.value?.description
    || 'Giải pháp toàn diện thực hiện chuyển đổi số cho doanh nghiệp. Môi trường làm việc cộng tác, chia sẻ, tăng hiệu suất công việc.');
const loginButtonText = computed(() => {
  if (signingIn.value) {
    return t('authentication.login.verifyingAccount');
  }
  if (loadingRolePermissions.value) {
    return t('authentication.login.retrievingPermissionInformation');
  }
  return t('common.signIn');
});
const validateRules = {
  email: {
    required: helpers.withMessage(t('authentication.login.usernameRequired'), required),
    valid: helpers.withMessage(t('common.invalidEmail'), (value: string) => {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());
    })
  },
  password: { required: helpers.withMessage(t('authentication.login.passwordRequired'), required) },
};

const v$ = useVuelidate(validateRules, loginInfo);

watch([loginInfo, isCaptchaValid], () => {
  errorCode.value = '';
});

watch(loginBackground, (value) => {
  changeTitleColor(value);
});

onMounted(() => {
  getPublicProductInfo().then((response: any) => {
    response && (info.value = response);
    document.title = response.browserTitle || 'Zamora.vn';
  });
});

function changeUserAvatar() {
  const avatar = getUser(loginInfo.email)?.avatar;
  userAvatar.value = avatar ? generatePreviewFileUrl(avatar) : '';
}

function userLogin(otp = '') {
  if (loginFailed.value === LOGIN.LOGIN_FAILED_ALLOW - 1) {
    showOtpDialog.value = false;
  }
  if (loginFailed.value >= LOGIN.LOGIN_FAILED_ALLOW) {
    if (isCaptchaValid.isEmpty) {
      captchaError.value = 'authentication.login.emptyCaptcha';
      return;
    }
    if (!isCaptchaValid.isValid) {
      if (captchaInvalid.value >= LOGIN.CAPTCHA_INVALID_ALLOW - 1) {
        //TODO gọi api khóa tài khoản, rồi hiển thị InformationDialog như bên dưới

        captchaError.value = '';
        errorCode.value = '';
        let type = ACTION_RESULT.SUCCESS;
        loginFailed.value = 0;

        assign(informationDialog, {
          type,
          title: 'common.requestSentSuccessfully',
          message: 'authentication.forgotPassword.accessEmail',
          show: true
        });
      } else {
        captchaInvalid.value++;
        captchaError.value = 'authentication.login.invalidCaptcha';
      }
      return;
    }
    captchaError.value = '';
  }

  signingIn.value = true;
  const {
    email,
    password
  } = loginInfo;
  login(email, password, isEmpty(otp) ? undefined : otp).then((response) => {
    if (response) {
      signingIn.value = false;
      setUserInfoAfterLogin(response);
    }

  }).catch((error) => {
    signingIn.value = false;
    const code = get(error, 'code');
    if (code == OTP_CODE_REQUIRED) {
      showOtpDialog.value = true;
    } else {
      if (loginFailed.value >= LOGIN.LOGIN_FAILED_ALLOW) {
        showOtpDialog.value = false;
        let resetCaptcha = document.getElementsByClassName('vue_client_recaptcha_icon');
        if (resetCaptcha.length) {
          (resetCaptcha[0] as HTMLElement).click();
        }
      }
      errorCode.value = code;
    }
  });
}

function signIn() {
  if (signingIn.value || loadingRolePermissions.value) {
    return;
  }
  v$.value.$validate().then((isValid) => {
    if (isValid) {
      userLogin();
    }
  });
}

function updateValidCaptcha(value: { isEmpty?: boolean, isValid?: boolean }) {
  isCaptchaValid.isEmpty = value.isEmpty;
  isCaptchaValid.isValid = value.isValid;
}

function changeTitleColor(bgSrc: string) {
  const color = calculateColorBasedOnBackground(bgSrc);
  if (color) {
    titleColor.value = color;
  }
}

</script>

<style lang='scss' scoped>
$topbar-height: 4rem;
.login-container {
  height: 100vh;
  background-image: v-bind(loginBackgroundUrl);
  background-repeat: no-repeat;
  background-size: cover;

  .login-topbar {
    height: $topbar-height;
    display: flex;
    align-items: center;
    padding: 0 2rem 0 1rem;
    justify-content: space-between;

    .app-logo {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      img {
        height: 3rem;
        width: 3rem;
      }

      span {
        font-size: 2rem;
        font-weight: 700;
        margin-left: 0.5rem;
        color: var(--primary-color-text);
      }
    }

    .phone {
      color: var(--primary-color-text);
    }
  }

  .login-content-wrapper {
    height: calc(100vh - #{$topbar-height});

    .app-title {
      color: v-bind(titleColor);
      white-space: pre-line;
    }
  }
}
</style>