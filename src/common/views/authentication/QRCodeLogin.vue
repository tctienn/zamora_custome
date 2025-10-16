<template>
  <Card>
    <template #title>
      <div class='align-items-center flex gap-2'>
        <Button
          v-tooltip.bottom='t("common.back")'
          icon='pi pi-arrow-left'
          rounded
          text
          @click='clearIntervalAndBack'/>
        <div class='font-semibold text-2xl'>{{ t('authentication.login.byQrCode') }}</div>
      </div>
    </template>
    <template #content>
      <div class='flex flex-column gap-4'>
        <div
          v-if='qrCodeData'
          class='align-items-center flex h-full justify-content-center'>
          <img
            alt='qrcode'
            class='max-w-20rem'
            :src='qrCodeData'/>
        </div>
        <AppLoader v-else/>
        <template v-if='qrCodeData'>
          <div>
            Mã QR hết hạn sau {{ expiredAfter }}s
          </div>
          <div>
            <div>1. Mở ứng dụng Zamora trên điện thoại của bạn</div>
            <div>2. Vào mục <b>Tài khoản > Đăng nhập bằng mã QR</b></div>
            <div>3. Quét mã QR và xác nhận đăng nhập</div>
          </div>
        </template>

      </div>
    </template>
  </Card>
</template>

<script lang='ts' setup>

import jsQR from 'jsqr';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generateLoginQrCodeForWeb, statusLogin } from '@/common/api/rest/qr-login';
import AppLoader from '@/common/components/loader/AppLoader.vue';
import type { UserLoginResponse } from '@/common/model/User';
import { useAuthHelper } from '@/common/views/authentication/auth';
import { decryptQrLoginToken } from '@/common/views/authentication/decrypt';

const emits = defineEmits(['back']);
const { t } = useI18n();
const qrCodeData = ref('');
const expiredAfter = ref<number>();
let expiredInterval: NodeJS.Timeout;
let timeoutId: NodeJS.Timeout;

const { setUserInfoAfterLogin } = useAuthHelper();
onMounted(() => {
  generateLoginQrCodeForWeb().then((response) => {
    if (response) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(response);
      fileReader.onload = () => {
        qrCodeData.value = fileReader.result as string;
        expiredAfter.value = 2 * 60;
        expiredAfterDecrease();
        readQrCode();
      };
    }
  });
});

watch(expiredAfter, (value) => {
  if (value === 0) {
    clearIntervalAndBack();
  }
});

function readQrCode() {
  const img = new Image();
  img.src = qrCodeData.value;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context?.drawImage(img, 0, 0, img.width, img.height);

    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData) {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      const token = code?.data;
      if (token) {
        const url = decryptQrLoginToken(token);
        if (url) {
          const sessionRegex = new RegExp('sessionId=([a-zA-Z0-9-]+)');
          const sessionId = url.match(sessionRegex)?.[1];
          sessionId && postQrCodeData(sessionId);
        }
      }
    }
  };
}

function postQrCodeData(sessionId: string) {
  const pollingInterval = 5000;
  const maxPollingDuration = 2 * 60 * 1000;
  const startTime = Date.now();
  let numberOfRetry = 0;

  async function makeRequest() {
    try {
      const data = await statusLogin(sessionId);

      if (data !== 'PENDING') {
        setUserInfoAfterLogin(data as UserLoginResponse);
        clearInterval(expiredInterval);
        return;
      }
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < maxPollingDuration) {
        timeoutId = setTimeout(makeRequest, pollingInterval); // Schedule next request
      } else {
        clearIntervalAndBack();
      }
    } catch (error: any) {
      console.error('Error making API request:', error);
      if (error.code === 'expiredQRCode' || error.code === 'invalidQRCode') {
        clearIntervalAndBack();
        return;
      }
      if (numberOfRetry < 3) {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime < maxPollingDuration) {
          timeoutId = setTimeout(makeRequest, pollingInterval); // Schedule next request
          numberOfRetry++;
        } else {
          clearIntervalAndBack();
        }
      }
    }
  }

  makeRequest();
}

function expiredAfterDecrease() {
  expiredInterval = setInterval(() => {
    if (expiredAfter.value) {
      expiredAfter.value--;
    } else {
      clearInterval(expiredInterval);
    }
  }, 1000);
}

function clearIntervalAndBack() {
  clearInterval(expiredInterval);
  clearTimeout(timeoutId);
  emits('back');
}
</script>

<style scoped>

</style>